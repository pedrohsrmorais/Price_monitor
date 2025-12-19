import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Token ausente" });

  const [, token] = auth.split(" ");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET não configurado");
    }

    req.user = { id: decoded.userId };
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}
