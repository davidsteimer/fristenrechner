"""Independent Python validation of the real, pending C3 transport candidate."""
import copy
import json
import unittest
from pathlib import PurePosixPath

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource
from ap22c1_contract import (ROOT, BASE, PREFIX, ROLE_SCHEMAS, ContractError, require,
                            read_json, sha, check_schema, validate_catalog, validate_calendars)

BUNDLE = ROOT / "outputs/ap22c3-2026-10-08/bundle"


def validate(manifest, files):
    schemas = {}
    for folder in (ROOT / "schemas", ROOT / "schemas/implementation/ap22c1", ROOT / "schemas/implementation/ap22c3"):
        for path in folder.glob("*.schema.json"):
            schema = read_json(path)
            schemas[schema["$id"]] = schema
    registry = Registry().with_resources((key, Resource.from_contents(value)) for key, value in schemas.items())
    schema = schemas[PREFIX + "local-reference-manifest-v7.schema.json"]
    errors = list(Draft202012Validator(schema, registry=registry, format_checker=FormatChecker()).iter_errors(manifest))
    require(not errors, str(errors[0].message) if errors else "")
    require(manifest["coverage"] == {"from": "2026-08-29", "to": None}, "Unexpected coverage")
    descriptors = manifest["artifacts"]
    require(len(descriptors) == 40 and len({a["path"] for a in descriptors}) == 40, "Incomplete inventory")
    require(set(files) == {a["path"] for a in descriptors}, "Files differ from manifest")
    documents = {}
    source_ids = set()
    roles = {role: set() for role in ROLE_SCHEMAS}
    for artifact in descriptors:
        path = PurePosixPath(artifact["path"])
        require(not path.is_absolute() and ".." not in path.parts and "\\" not in str(path), "Unsafe path")
        raw = files[str(path)]
        require(len(raw) == artifact["byteLength"] and sha(raw) == artifact["sha256"], "Unbound bytes")
        value = json.loads(raw)
        role = artifact["role"]
        check_schema(ROLE_SCHEMAS[role], value)
        require(value["$schema"] == artifact["schemaId"] == PREFIX + ROLE_SCHEMAS[role], "Wrong schema")
        require(value["dataKind"] == role, "Wrong role")
        id_key = "calendarId" if role == "calendar" else "profileId" if role == "legalProfile" else "catalogId"
        require(value[id_key] == artifact["contentId"] and value[id_key] not in documents, "Wrong or duplicate ID")
        documents[value[id_key]] = value
        roles[role].add(value[id_key])
        source_ids.update(source["sourceId"] for source in value.get("sources", []))
    for role, key in (("calendar", "calendarIds"), ("legalProfile", "profileIds"), ("holidayCatalog", "holidayCatalogIds"),
                      ("specialRegimeCatalog", "specialRegimeCatalogIds"), ("socialProcedureCatalog", "socialProcedureCatalogIds")):
        require(roles[role] == set(manifest[key]), "Role inventory differs")
    require(source_ids == set(manifest["sourceSummary"]["sourceIds"]), "Source registry differs")
    catalog_bytes = files["holiday-catalogs/ch-holiday-catalog.json"]
    catalog = documents["ch-holiday-catalog"]
    validate_catalog(catalog, catalog_bytes)
    validate_calendars(catalog, catalog_bytes, {key: documents[key] for key in roles["calendar"]})
    social = documents["ch-social-procedures"]
    old = read_json(BASE / "social-procedures/ch-social-procedures.json")
    for key in old:
        if key not in {"review", "releaseEligibility"}:
            require(social[key] == old[key], "Social contents changed")
    review = copy.deepcopy(old["review"])
    review["status"] = "candidate"
    require(social["review"] == review, "Invented social review")
    require(len(social["releaseEligibility"]) == 50, "Incomplete social bindings")
    old_entries = {entry["eligibilityId"]: entry for entry in old["releaseEligibility"]}
    require(set(old_entries) == {entry["eligibilityId"] for entry in social["releaseEligibility"]}, "Social IDs changed")
    expected_refs = {(a["role"], a["contentId"]): a["sha256"] for a in descriptors
                     if a["contentId"] in {"ch-federal-calendar", "be-public-holidays", "ch-holiday-catalog"}}
    for entry in social["releaseEligibility"]:
        require(entry["releaseId"] == manifest["releaseId"] and entry["status"] == "candidate" and entry["approval"] is None,
                "Wrong social release binding")
        previous = old_entries[entry["eligibilityId"]]
        require(all(entry[key] == previous[key] for key in previous if key not in {"releaseId", "status", "approval", "componentRefs"}),
                "Social coverage or facts changed")
        refs = {(r["role"], r["contentId"]): r["sha256"] for r in entry["componentRefs"]}
        require(len(refs) == len(entry["componentRefs"]) and refs == expected_refs, "Social component hash changed")


class AP22C3Contract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest = read_json(BUNDLE / "manifest.json")
        cls.files = {a["path"]: (BUNDLE / a["path"]).read_bytes() for a in cls.manifest["artifacts"]}

    def test_real_candidate(self):
        validate(copy.deepcopy(self.manifest), dict(self.files))

    def test_pending_candidate_does_not_pass_production_schema(self):
        with self.assertRaises(ContractError):
            check_schema("release-manifest-v7.schema.json", self.manifest)


def negative(name, change):
    def run(self):
        manifest, files = copy.deepcopy(self.manifest), dict(self.files)
        change(manifest, files)
        with self.assertRaises((ContractError, KeyError)):
            validate(manifest, files)
    setattr(AP22C3Contract, "test_reject_" + name, run)


def change_component(manifest, files, path, mutate):
    value = json.loads(files[path])
    mutate(value)
    raw = (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()
    files[path] = raw
    descriptor = next(a for a in manifest["artifacts"] if a["path"] == path)
    descriptor.update(sha256=sha(raw), byteLength=len(raw))


negative("false_approval", lambda m, f: m.update(releaseStatus="approved"))
negative("invented_source_review", lambda m, f: m["sourceSummary"].update(legalBasisReviewStatus="verified"))
negative("missing_artifact", lambda m, f: f.pop("calendars/be-public-holidays.json"))
negative("extra_artifact", lambda m, f: f.update({"extra.json": b"{}"}))
negative("wrong_bytes", lambda m, f: f.update({"calendars/be-public-holidays.json": f["calendars/be-public-holidays.json"] + b" "}))
negative("missing_source", lambda m, f: m["sourceSummary"]["sourceIds"].pop())
negative("old_consumer", lambda m, f: m["compatibility"].update(minimumConsumerFormatVersion="6.0.0"))
negative("old_calendar_format", lambda m, f: change_component(m, f, "calendars/be-public-holidays.json", lambda v: v.update(formatVersion="2.0.0")))
negative("social_stale_release", lambda m, f: change_component(m, f, "social-procedures/ch-social-procedures.json", lambda v: v["releaseEligibility"][0].update(releaseId="2026-10-01-mvp-06-approved.1")))
negative("social_future_coverage", lambda m, f: change_component(m, f, "social-procedures/ch-social-procedures.json", lambda v: v["releaseEligibility"][0]["caseCoverage"].update(to="2028-12-31")))
negative("social_extra_canton", lambda m, f: change_component(m, f, "social-procedures/ch-social-procedures.json", lambda v: v["cantonalBindings"][0].update(procedureContextCanton="ZH")))
negative("projection_change", lambda m, f: change_component(m, f, "calendars/be-public-holidays.json", lambda v: v["rules"][0]["calculation"].update(day=6)))

if __name__ == "__main__":
    unittest.main()
