/* eslint-disable no-unused-vars */
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
    Name // String
    Age // Number
    InstitutionalPatientId // String
    JSOGId // String
    NCDId // String
    DateOfProcedure // DateString
    ProcedureTime // String
    TypeOfProcedure // String
    PresentAE // Boolean
    AEs // Array of object AE
    Diagnoses // Array of object Diagnosis
    Procedures // Array of object Procedure
    Imported // Boolean
    ValidationReport // Array of String
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
