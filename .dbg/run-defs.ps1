$env:PGPASSWORD = "omid1377"
$query = @'
SELECT "Id", "Name", "Code", "LabTestCategoryId" FROM "LabTestDefinitions" ORDER BY "LabTestCategoryId", "Id";
'@
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -p 5432 -U postgres -d SalmandyarDb -c $query
