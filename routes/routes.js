const express = require('express');
const router = express.Router();
const User = require('../crud/models/users');
const multer = require('multer');
const fs = require('fs');

// Configuração do armazenamento de imagem
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '_' + Date.now() + '_' + file.originalname);
    }
});

const upload = multer({ storage: storage }).single('image');

// Rota para adicionar um usuário
router.post('/add', upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
        });

        await user.save();

        req.session.message = {
            type: 'success',
            message: 'Usuário adicionado com sucesso!',
        };
        res.redirect('/');
    } catch (err) {
        console.error('Erro ao salvar o usuário:', err);
        res.json({ message: err.message, type: 'danger' });
    }
});

// Rota para obter todos os usuários
router.get('/', async (req, res) => {
    try {
        const users = await User.find().exec();
        res.render('crud-cadastro', {
            title: 'Home Page',
            users: users,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});

// Rota para exibir o formulário de adição de usuário
router.get('/add', (req, res) => {
    res.render('add_users', { title: 'Adicionar Usuários' });
});

// Rota para editar um usuário
router.get('/edit/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id).exec();

        if (!user) {
            return res.redirect('/');
        }

        res.render('edit_users', {
            title: 'Editar Usuário',
            user: user
        });
    } catch (err) {
        console.error('Erro ao buscar o usuário:', err);
        res.redirect('/');
    }
});

// Rota para atualizar um usuário
router.post('/update/:id', upload, async (req, res) => {
    try {
        const id = req.params.id;
        let new_image = req.body.old_image;

        if (req.file) {
            new_image = req.file.filename;

            // Remover o arquivo de imagem antiga
            try {
                fs.unlinkSync(`./uploads/${req.body.old_image}`);
            } catch (err) {
                console.log('Erro ao remover o arquivo antigo:', err);
            }
        }

        await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        });

        req.session.message = {
            type: 'success',
            message: 'Usuário atualizado com sucesso!',
        };
        res.redirect('/');
    } catch (err) {
        console.error('Erro ao atualizar o usuário:', err);
        res.json({ message: err.message, type: 'danger' });
    }
});

module.exports = router;
