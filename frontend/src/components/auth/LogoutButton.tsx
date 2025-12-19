import { useNavigate } from "react-router-dom";

export function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove o token JWT
    localStorage.removeItem("token");

    // Redireciona para a tela de login
    navigate("/login", { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-muted-foreground hover:text-red-500 transition"
    >
      Sair
    </button>
  );
}
