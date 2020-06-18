class Institution {
    InstitutionName // String
    InstitutionId // String
    LockedInstitutionProperty // Bloolean
}

class DatabaseProperty {
    ApplicationVersion // String
    CreateDate // DateString
    Year // String
}

class Cases {
    _id // Applied by nedb
    SequentialId // Number
    UniqueId // String : created on export
    ValidationReport // Array of String
    Name // String
    Age // Number
    InstitutionalPatientId // String
    JSOGId // String
    NCDId // String
    DateOfProcedure // DateString
    ProcedureTime // String
    TypeOfProcedure // String
    PresentAE // Boolean
    Diagnoses // Array of object Diagnosis
    Procedures // Array of object Procedure
    AEs // Array of object AE
}

class Diagnosis {
    Diagnosis
}

class Procedure {
    Procedure
    TypeOfProcedure
    AssociatedProcedures
}

class AE {
    Category
    Title
    Cause
    Location
    BloodCounts
    Grade
    Course
}
