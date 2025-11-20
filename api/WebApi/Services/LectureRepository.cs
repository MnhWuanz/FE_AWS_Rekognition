using Dapper;
using Npgsql;
using WebApi.Models;
using WebApi.Services.Interface;

namespace WebApi.Services;

public class LectureRepository(NpgsqlDataSource dataSource) : ILecturerRepository
{
    public async Task<int> AddAsync(Lecturer entity)
    {
        const string sql = """

                           INSERT INTO lecturer (id, name, email, phone)
                           VALUES (@id, @Name, @Email, @Phone)
                           RETURNING id;
                           """;
        await using var conn = await dataSource.OpenConnectionAsync();
        return await conn.ExecuteScalarAsync<int>(sql, entity);
    }

    public async Task<int> UpdateAsync(Lecturer entity)
    {
        const string sql = """
                           UPDATE lecturer
                           SET name = @Name,
                               email = @Email,
                               phone = @Phone
                           WHERE id = @id;
                           """;
        await using var conn = await dataSource.OpenConnectionAsync();
        return await conn.ExecuteAsync(sql, entity);
    }

    public async Task<IReadOnlyList<Lecturer>> GetAllAsync()
    {
        const string sql = "SELECT * FROM lecturer ORDER BY id;";
     
        await using var conn = await dataSource.OpenConnectionAsync();
        var result = await conn.QueryAsync<Lecturer>(sql);
        return result.ToList();
    }

    public async Task<Lecturer?> GetByIdAsync(int id)
    {
        const string sql = "SELECT * FROM lecturer  WHERE id=@Id;";
      
        await using var conn = await dataSource.OpenConnectionAsync();
        return await conn.QuerySingleOrDefaultAsync<Lecturer>(sql, new { Id = id });
    }

    public async Task<int> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM lecturer WHERE id = @Id;";
     
        await using var conn = await dataSource.OpenConnectionAsync();
        return await conn.ExecuteAsync(sql, new { Id = id });
    }
}