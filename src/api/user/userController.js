const express = require("express");
const bcrypt = require("bcrypt");
const UserService = require("./userService");
const User = require("./userModel")

const router = express.Router();

const { generateToken } = require("../../services/authService");
const authMiddleware = require("../../middleware/authMiddleware");
const upload = require("../../middleware/uploadMiddleware");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
    }

    const existingUser = await UserService.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const user = new UserService({
      name,
      email,
      password,
    });

    await user.save();
    res.status(201).json({ message: "Usuário criado com sucesso!", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const user = await UserService.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Usuário não encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Senha incorreta" });
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.json({ message: "Login bem-sucedido!", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no login" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await UserService.find().select("_id avatar name email");
    if (!users || users.length === 0) {
      return res.status(404).json({ error: "Nenhum usuário encontrado" });
    }

    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

router.get("/user", authMiddleware, async (req, res) => {
  const { userId } = req.params

  try {
    const user = await User.findById(req.user).select("_id avatar name email");

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json({ id: user._id, avatar: user.avatar, name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuário autenticado" });
  }
});

router.get("/users/:userId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("_id avatar name email password banner biography");

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    res.json({ id: user._id, avatar: user.avatar, name: user.name, email: user.email, password: user.password, posts: user.posts, biography: user.biography, banner: user.banner });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
});

router.put("/users/:id", authMiddleware, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), async (req, res) => {
  try {
    const { nickname, name, email, password, bio } = req.body;
    const user = await UserService.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (req.files.avatar) {
      user.avatar = req.files.avatar[0].path;
    }
    
    if (req.files.banner) {
      user.banner = req.files.banner[0].path;
    }

    user.nickname = nickname || user.nickname;
    user.name = name || user.name;
    user.email = email || user.email;
    user.biography = bio || user.bio;

    if (password) {
      user.password = password;
    }

    await user.save();
    res.json({ message: "Usuário atualizado com sucesso!", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    await user.remove();

    res.json({ message: "Usuário excluído com sucesso", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao excluir usuário" });
  }
});

router.delete("/users", async (req, res) => {
  try {
    const result = await User.deleteMany({});

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Nenhum usuário encontrado para excluir" });
    }

    res.json({ message: "Todos os usuários foram excluídos com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao excluir usuários" });
  }
});

module.exports = router;