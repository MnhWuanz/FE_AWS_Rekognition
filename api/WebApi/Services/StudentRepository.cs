using Dapper;
using Npgsql;
using WebApi.Models;
using WebApi.Services.Interface;

namespace WebApi.Services;

public class StudentRepository(NpgsqlDataSource dataSource) : IStudentRepository
{
    public async Task<int> AddAsync(Student entity)
    {
        const string sql = """
                           INSERT INTO students (code, name, email, face_id)
                           VALUES (@Code, @Name, @Email, @FaceId)
                           RETURNING id;
                           """;

        await using var conn = await dataSource.OpenConnectionAsync();
        var id = await conn.ExecuteScalarAsync<int>(sql, entity);
        return id;
    }


    public async Task<int> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM students WHERE id = @Id;";
        
        await using var conn = await dataSource.OpenConnectionAsync();
        return await conn.ExecuteAsync(sql, new { Id = id });
    }

    public async Task<IReadOnlyList<Student>> GetAllAsync()
    {
        const string sql = "SELECT * FROM students ORDER BY id;";
        
        await using var conn = await dataSource.OpenConnectionAsync();
        var result = await conn.QueryAsync<Student>(sql);
        return result.ToList();
    }

    public async Task<Student?> GetByIdAsync(int id)
    {
        const string sql = "SELECT * FROM students WHERE id=@Id;";
        
        await using var conn = await dataSource.OpenConnectionAsync();
        return await conn.QuerySingleOrDefaultAsync<Student>(sql, new { Id = id });
    }

    public async Task<int> UpdateAsync(Student entity)
    {
        const string sql = """
                           UPDATE students
                           SET code = @Code,
                               name = @Name,
                               email = @Email,
                               face_id = @FaceId
                           WHERE id = @id;
                           """;

        await using var conn = await dataSource.OpenConnectionAsync();
        return await conn.ExecuteAsync(sql, entity);
    }
}