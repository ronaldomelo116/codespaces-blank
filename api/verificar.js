// Arquivo: api/verificar.js
const dados = require('./dados.json');

export default function handler(req, res) {
    // Aceita apenas requisições do tipo POST (envio de dados)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    // Pega os dados que o Front-end enviou
    const { moduloId, questionIndex, selectedOption } = req.body;

    // Busca o módulo e a questão no banco de dados secreto
    const modulo = dados.find(m => m.id === moduloId);
    if (!modulo) return res.status(404).json({ error: 'Módulo não encontrado' });

    const question = modulo.questions[questionIndex];
    if (!question) return res.status(404).json({ error: 'Questão não encontrada' });

    // Verifica se a opção que o usuário mandou é igual ao gabarito
    const acertou = selectedOption === question.correctAnswer;

    // Devolve o resultado, qual era a certa (para pintar de verde) e a explicação
    res.status(200).json({
        acertou: acertou,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
    });
}