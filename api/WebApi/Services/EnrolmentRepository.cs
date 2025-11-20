using Dapper;
using Npgsql;
using WebApi.Models;
using WebApi.Services.Interface;

namespace WebApi.Services;

public class EnrolmentRepository(NpgsqlDataSource dataSource) : IEnrolmentRepository
{
    public async Task<int> AddAsync(Enrolment entity)
    {
        const string sql = """
                           INSERT INTO enrolment (student_id, course_id, status)
                           VALUES (@Student_id, @Course_id, @Status)
                           RETURNING id;
                           """;

        await using var conn = await dataSource.OpenConnectionAsync();
        return await conn.ExecuteScalarAsync<int>(sql, entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM enrolment WHERE id = @Id;";
       
        await using var conn = await dataSource.OpenConnectionAsync();
        return await conn.ExecuteAsync(sql, new { Id = id });
    }

    public async Task<IReadOnlyList<Enrolment>> GetAllAsync()
    {
        const string sql = "SELECT * FROM enrolment ORDER BY id";
       
        await using var conn = await dataSource.OpenConnectionAsync();
        var result = await conn.QueryAsync<Enrolment>(sql);
        return result.ToList();
    }

    public async Task<Enrolment?> GetByIdAsync(int id)
    {
        const string sql = "SELECT * FROM enrolment WHERE id=@Id;";
       
        await using var conn = await dataSource.OpenConnectionAsync();
        return await conn.QuerySingleOrDefaultAsync<Enrolment>(sql, new { Id = id });
    }

    public async Task<int> UpdateAsync(Enrolment entity)
    {
        const string sql = """
                           UPDATE enrolment
                           SET student_id = @Student_id,
                               course_id = @Course_id,
                               status = @Status
                           WHERE id = @id;
                           """;

        await using var conn = await dataSource.OpenConnectionAsync();
        return await conn.ExecuteAsync(sql, entity);
    }
}