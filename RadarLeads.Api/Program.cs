using System.Text.Json;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Habilita o uso de requisições HTTP na nossa API
builder.Services.AddHttpClient();
builder.Services.AddCors(options => options.AddPolicy("PermitirTudo", policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();
app.UseCors("PermitirTudo");

app.MapGet("/", () => "API do Radar da Atlas Web online e pronta para mapear clientes!");

app.MapGet("/api/buscar-leads", async (string nicho, string localizacao, IHttpClientFactory httpClientFactory) =>
{
    var apiKey = Environment.GetEnvironmentVariable("GOOGLE_API_KEY");

    if (string.IsNullOrEmpty(apiKey))
    {
        return Results.Problem("Chave da API do Google não configurada no servidor.");
    }

    var query = $"{nicho} em {localizacao}";
    var url = "https://places.googleapis.com/v1/places:searchText";

    var requestBody = new { textQuery = query };
    var jsonBody = JsonSerializer.Serialize(requestBody);
    var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

    var client = httpClientFactory.CreateClient();

    // Passando a chave de segurança e pedindo APENAS os campos que importam para economizar dados
    client.DefaultRequestHeaders.Add("X-Goog-Api-Key", apiKey);
    client.DefaultRequestHeaders.Add("X-Goog-FieldMask", "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri");

    var response = await client.PostAsync(url, content);

    if (!response.IsSuccessStatusCode)
    {
        var error = await response.Content.ReadAsStringAsync();
        return Results.BadRequest(new { erro = "Falha ao consultar o Google", detalhes = error });
    }

    // Lê a resposta bruta do Google
    var jsonResponse = await response.Content.ReadAsStringAsync();
    using var doc = JsonDocument.Parse(jsonResponse);

    // O filtro mágico: vamos devolver apenas as empresas que NÃO têm site
    var empresasSemSite = new List<object>();

    if (doc.RootElement.TryGetProperty("places", out var places))
    {
        foreach (var place in places.EnumerateArray())
        {
            // Se o campo websiteUri NÃO existir, significa que a empresa não tem site
            if (!place.TryGetProperty("websiteUri", out _))
            {
                empresasSemSite.Add(new
                {
                    Nome = place.TryGetProperty("displayName", out var nameObj) ? nameObj.GetProperty("text").GetString() : "Sem Nome",
                    Endereco = place.TryGetProperty("formattedAddress", out var addr) ? addr.GetString() : "Sem Endereço",
                    Telefone = place.TryGetProperty("nationalPhoneNumber", out var phone) ? phone.GetString() : "Sem Telefone"
                });
            }
        }
    }

    return Results.Ok(empresasSemSite);
});

app.Run();