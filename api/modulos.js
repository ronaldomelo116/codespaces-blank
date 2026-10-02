// Arquivo: api/modulos.js
const dados = require('./dados.json');

export default function handler(req, res) {
    // Mapeia os dados para remover as respostas corretas e explicações
    const modulosSeguros = dados.map(modulo => {
        return {
            ...modulo,
            questions: modulo.questions.map(q => ({
                text: q.text,
                options: q.options
                // Note que não estamos enviando 'correctAnswer' nem 'explanation'
            }))
        };
    });

    res.status(200).json(modulosSeguros);
}