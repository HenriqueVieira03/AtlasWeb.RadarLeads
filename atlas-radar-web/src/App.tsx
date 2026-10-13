import { useState } from 'react'

interface Empresa {
    nome: string;
    endereco: string;
    telefone: string;
}

function App() {
    const [nicho, setNicho] = useState('Clínica Odontológica');
    const [localizacao, setLocalizacao] = useState('Erechim');
    const [leads, setLeads] = useState<Empresa[]>([]);
    const [loading, setLoading] = useState(false);

    const buscarLeads = async () => {
        setLoading(true);
        try {
            // ATENÇÃO: Substitua PORTA_DA_API pela porta que o Visual Studio abriu (ex: 5000, 7123, etc)
            const url = `http://localhost:32768/api/buscar-leads?nicho=${nicho}&localizacao=${localizacao}`;
            const response = await fetch(url);
            const data = await response.json();
            setLeads(data);
        } catch (error) {
            console.error("Erro na busca:", error);
            alert("Erro ao conectar com a API. Verifique se o backend em C# está rodando.");
        } finally {
            setLoading(false);
        }
    };

    const abrirWhatsApp = (telefone: string, nome: string) => {
        // Remove tudo que não for número do telefone
        const numeroLimpo = telefone.replace(/\D/g, '');
        const mensagem = encodeURIComponent(`Olá, equipe da ${nome}! Vi vocês no Google Maps e percebi que estão sem site próprio. Trabalho na Atlas Web e criamos páginas rápidas para atrair mais clientes locais. Podemos conversar?`);
        window.open(`https://wa.me/55${numeroLimpo}?text=${mensagem}`, '_blank');
    };

    return (
        <div className= "min-h-screen bg-gray-50 p-8 font-sans" >
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden" >

        {/* Cabeçalho */ }
            < div className = "bg-slate-900 p-6" >
                <h1 className="text-2xl font-bold text-white" > Radar de Leads - Atlas Web </h1>
                    < p className = "text-slate-400 mt-1" > Encontre estabelecimentos sem presença digital no Google Maps </p>
                        </div>

    {/* Área de Busca */ }
    <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row gap-4 items-end" >
        <div className="flex-1 w-full" >
            <label className="block text-sm font-medium text-gray-700 mb-1" > Nicho / Segmento </label>
                < input
    type = "text"
    value = { nicho }
    onChange = {(e) => setNicho(e.target.value)
}
className = "w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-slate-900 outline-none"
placeholder = "Ex: Oficina Mecânica"
    />
    </div>
    < div className = "flex-1 w-full" >
        <label className="block text-sm font-medium text-gray-700 mb-1" > Localização </label>
            < input
type = "text"
value = { localizacao }
onChange = {(e) => setLocalizacao(e.target.value)}
className = "w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-slate-900 outline-none"
placeholder = "Ex: Passo Fundo"
    />
    </div>
    < button
onClick = { buscarLeads }
disabled = { loading }
className = "w-full md:w-auto bg-slate-900 text-white font-semibold py-2 px-6 rounded-md hover:bg-slate-800 transition disabled:opacity-50"
    >
{ loading? 'Buscando...': 'Buscar Alvos' }
    </button>
    </div>

{/* Tabela de Resultados */ }
<div className="p-6" >
    {
        leads.length === 0 && !loading ? (
            <div className= "text-center text-gray-500 py-10" > Nenhum lead encontrado ainda.Faça uma busca!</ div >
          ) : (
    <div className= "overflow-x-auto" >
    <table className="w-full text-left border-collapse" >
        <thead>
        <tr className="border-b-2 border-gray-200" >
            <th className="pb-3 font-semibold text-gray-700" > Estabelecimento </th>
                < th className = "pb-3 font-semibold text-gray-700" > Endereço </th>
                    < th className = "pb-3 font-semibold text-gray-700" > Telefone </th>
                        < th className = "pb-3 font-semibold text-gray-700 text-center" > Ação </th>
                            </tr>
                            </thead>
                            <tbody>
{
    leads.map((lead, index) => (
        <tr key= { index } className = "border-b border-gray-100 hover:bg-gray-50 transition" >
        <td className="py-4 pr-4 font-medium text-gray-900" > { lead.nome } </td>
    < td className = "py-4 pr-4 text-gray-600 text-sm" > { lead.endereco } </td>
    < td className = "py-4 pr-4 text-gray-600" > { lead.telefone } </td>
    < td className = "py-4 text-center" >
    <button 
                          onClick={() => abrirWhatsApp(lead.telefone, lead.nome)}
className = "bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition text-sm font-medium"
    >
    Chamar no Whats
        </button>
        </td>
        </tr>
                  ))}
</tbody>
    </table>
    </div>
          )}
</div>

    </div>
    </div>
  )
}

export default App