const express = require("express");
const Post = require("./postModel");
const authMiddleware = require("../../middleware/authMiddleware");
const upload = require("../../middleware/uploadMiddleware");

const router = express.Router();

router.post('/posts', authMiddleware, upload.array('images', 4), async (req, res) => {
  try {
    const { content } = req.body;
    const images = req.files.map(file => file.path);

    if (!content || !content.trim()) {
      return res.status(400).send('O conteúdo da postagem é obrigatório.');
    }

    if (images.lenth > 4) {
      return res.status(400).send('Você pode adicionar no máximo 4 imagens.');
    }

    const newPost = new Post({
      user: req.user._id,
      content,
      images,
    });

    await newPost.save();
    res.status(201).send(newPost);

  } catch (error) {
    res.status(500).send('Erro ao criar o post.');
  }
});

router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'avatar name email').sort({ createdAt: -1 });
    
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).send('Erro ao buscar os posts.');
  }
});

router.get('/posts/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const posts = await Post.find({ user: userId }).populate('user', 'avatar name email'); 
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).send('Erro ao buscar os posts do usuário.');
  }
});

router.put('/posts/:postId', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.postId;
    const { content, images } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).send('O conteúdo da postagem é obrigatório.');
    }

    if (images && images.length > 4) {
      return res.status(400).send('Você pode adicionar no máximo 4 imagens.');
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).send('Post não encontrado.');
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).send('Você não tem permissão para editar este post.');
    }

    post.content = content;
    post.images = images;

    await post.save();
    res.status(200).send(post);
  } catch (error) {
    res.status(500).send('Erro ao atualizar o post.');
  }
});

router.delete('/posts/:postId', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).send('Post não encontrado.');
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).send('Você não tem permissão para excluir este post.');
    }

    await post.remove();
    res.status(200).send('Post deletado com sucesso.');
  } catch (error) {
    res.status(500).send('Erro ao deletar o post.');
  }
});

router.delete('/posts', async (req, res) => {
  try {
    const post = await Post.deleteMany({});

    if (!post) {
      return res.status(404).send('Nenhum post encontrado.');
    }

    res.status(200).send('Todos os posts foram deletados com sucesso.');
  } catch (error) {
    res.status(500).send('Erro ao deletar todos os post.');
  }
});

module.exports = router;