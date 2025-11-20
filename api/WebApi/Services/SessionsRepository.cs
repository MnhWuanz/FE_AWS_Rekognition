using Dapper;
using Npgsql;
using WebApi.Models;
using WebApi.Services.Interface;

namespace WebApi.Services;

public class SessionsRepository(NpgsqlDataSource dataSource) : ISessionsRepository
{
    public async Task<int> AddAsync(Enrolment entity)
    {
        const string sql = """
                           INSERT INTO enrolment (name, course_id)
                           VALUES (@name, @course_id)
                           RETURNING @id;
                           """;

        await using var conn = await dataSource.OpenConnectionAsync();
        return await conn.ExecuteScalarAsync<int>(sql, entity);
    }

    public async Task<int> AddAsync(Session entity)
    {
        const string sql = """
                           INSERT INTO sessions (name,course_id)
                           VALUES (@Name, @CourseID)
                           returning id;
                           """;

        await using var conn = await dataSource.OpenConnectionAsync();
        var id = await conn.QuerySingleAsync<int>(sql, entity);
        return id;
    }


    public async Task<int> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM sessions WHERE id = @Id;";

        try
        {
            await using var conn = await dataSource.OpenConnectionAsync();
            return await conn.ExecuteAsync(sql, new { Id = id });
        }
        catch (PostgresException ex) when (ex.SqlState == "23503") // FOREIGN KEY violation
        {
            throw new Exception("Cannot delete this session because it is referenced by another table.");
        }
    }

    public async Task<IReadOnlyList<Session>> GetAllAsync()
    {
        const string sql = "SELECT * FROM sessions ORDER BY id;";
      
        await using var conn = await dataSource.OpenConnectionAsync();
        var result = await conn.QueryAsync<Session>(sql);
        return result.ToList();
    }

    public async Task<Session?> GetByIdAsync(int id)
    {
        const string sql = "SELECT * FROM sessions WHERE id=@Id";
     
        await using var conn = await dataSource.OpenConnectionAsync();
        return await conn.QuerySingleOrDefaultAsync<Session>(sql, new { Id = id });
    }

    public async Task<int> UpdateAsync(Session entity)
    {
        const string sql = """
                           UPDATE sessions
                           SET  name = @Name,
                                course_id = @Course_id
                           WHERE id = @id;
                           """;

        await using var conn = await dataSource.OpenConnectionAsync();
        return await conn.ExecuteAsync(sql, entity);
    }
}