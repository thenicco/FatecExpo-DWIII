require('dotenv').config();


const https = require('https');      
const fs = require('fs');            
const express = require('express');
// const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  


/* mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('>>> Conectado ao MongoDB Atlas!'))
    .catch((err) => console.error('>>> Erro ao conectar ao MongoDB:', err));


const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true } 
});
const User = mongoose.model('User', UserSchema);
*/

const app = express();
app.use(express.json()); // Habilita o servidor para receber JSON


app.get('/', (req, res) => {
    res.send('Servidor HTTPS está no ar! Use a rota POST /registrar para testar.');
});


app.post('/registrar', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send('Email e senha são obrigatórios.');
        }

        // --- PONTO DE SEGURANÇA 1: HASHING DA SENHA ---
        // Nunca salve a senha pura ("senha123") no banco.
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log('>>> Recebido: Email:', email);
        console.log('>>> Senha pura:', password);
        console.log('>>> Senha com hash:', hashedPassword);

        /*
        const novoUsuario = new User({
            email: email,
            password: hashedPassword // Salva a senha segura
        });

        await novoUsuario.save(); */
        res.status(201).send('Usuário registrado com sucesso!');

    } catch (error) {
        // 'code: 11000' é erro de email duplicado no MongoDB
        if (error.code === 11000) {
            return res.status(400).send('Este email já está em uso.');
        }
        res.status(500).send('Erro no servidor: ' + error.message);
    }
});

const options = {
    key: fs.readFileSync('key.pem'),   // Nosso arquivo de chave privada
    cert: fs.readFileSync('cert.pem')  // Nosso arquivo de certificado
};

// 7. Iniciar o servidor HTTPS
const port = process.env.PORT || 8443;
https.createServer(options, app).listen(port, () => {
    console.log(`>>> Servidor HTTPS (MODO DE TESTE) rodando em https://localhost:${port}`);
});