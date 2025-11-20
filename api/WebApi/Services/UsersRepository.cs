using Dapper;
using Npgsql;
using WebApi.Models;
using WebApi.Services.Interface;

namespace WebApi.Services;

public class UsersRepository(NpgsqlDataSource dataSource) : IUsersRepository
{
    public async Task<User?> GetByIdAsync(int id)
    {
        const string sql = "SELECT * FROM users WHERE id=@Id;";

        await using var conn = await dataSource.OpenConnectionAsync();
        return await conn.QuerySingleOrDefaultAsync<User>(sql, new { Id = id });
    }

    public async Task<IReadOnlyList<User>> GetAllAsync()
    {
        const string sql = "SELECT * FROM users ORDER BY id;";

        await using var conn = await dataSource.OpenConnectionAsync();
        var result = await conn.QueryAsync<User>(sql);
        return result.ToList();
    }

    public async Task<int> AddAsync(User entity)
    {
        const string sql = """
                           INSERT INTO users (role, password, email)
                           VALUES (@Role, @Password, @Email)
                           RETURNING id;
                           """;

        await using var conn = await dataSource.OpenConnectionAsync();
        var id = await conn.ExecuteScalarAsync<int>(sql, entity);
        return id;
    }

    public async Task<int> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM users WHERE id = @Id;";

        await using var conn = await dataSource.OpenConnectionAsync();
        return await conn.ExecuteAsync(sql, new { Id = id });
    }

    public async Task<int> UpdateAsync(User entity)
    {
        const string sql = """
                           UPDATE users
                           SET role = @Role,
                               password = @Password,
                               email = @Email
                           WHERE id = @Id;
                           """;

        await using var conn = await dataSource.OpenConnectionAsync();
        return await conn.ExecuteAsync(sql, entity);
    }
}