import { authService } from "@/lib/services/auth.service";
import api from "@/lib/utils/api";

jest.mock("@/lib/utils/api");
const mockedApi = api as jest.Mocked<typeof api>;

const mockToken = "mock.jwt.token";
const mockUser = { id: 1, nombreCompleto: "Admin HCE", email: "admin@hce.com" };
const mockAuthResponse = { access_token: mockToken, user: mockUser };

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("login", () => {
    it("devuelve access_token y user al hacer login exitoso", async () => {
      mockedApi.post.mockResolvedValueOnce({ data: mockAuthResponse });

      const result = await authService.login({ email: "admin@hce.com", password: "admin123" });

      expect(mockedApi.post).toHaveBeenCalledWith("/auth/login", {
        email: "admin@hce.com",
        password: "admin123",
      });
      expect(result.access_token).toBe(mockToken);
      expect(result.user).toEqual(mockUser);
    });

    it("lanza error si las credenciales son inválidas", async () => {
      mockedApi.post.mockRejectedValueOnce(new Error("Unauthorized"));

      await expect(
        authService.login({ email: "wrong@hce.com", password: "wrong" })
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("register", () => {
    it("devuelve access_token y user al registrarse correctamente", async () => {
      mockedApi.post.mockResolvedValueOnce({ data: mockAuthResponse });

      const result = await authService.register({
        nombreCompleto: "Admin HCE",
        email: "admin@hce.com",
        password: "admin123",
      });

      expect(mockedApi.post).toHaveBeenCalledWith("/auth/register", {
        nombreCompleto: "Admin HCE",
        email: "admin@hce.com",
        password: "admin123",
      });
      expect(result.access_token).toBe(mockToken);
    });
  });

  describe("logout", () => {
    it("elimina hce_token y hce_user del localStorage", () => {
      localStorage.setItem("hce_token", mockToken);
      localStorage.setItem("hce_user", JSON.stringify(mockUser));

      authService.logout();

      expect(localStorage.getItem("hce_token")).toBeNull();
      expect(localStorage.getItem("hce_user")).toBeNull();
    });
  });

  describe("getCurrentUser", () => {
    it("retorna el usuario guardado en localStorage", () => {
      localStorage.setItem("hce_user", JSON.stringify(mockUser));

      const result = authService.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it("retorna null si no hay usuario en localStorage", () => {
      const result = authService.getCurrentUser();
      expect(result).toBeNull();
    });

    it("retorna null si el JSON está malformado", () => {
      localStorage.setItem("hce_user", "invalid-json{{{");
      const result = authService.getCurrentUser();
      expect(result).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("retorna true si existe hce_token en localStorage", () => {
      localStorage.setItem("hce_token", mockToken);
      expect(authService.isAuthenticated()).toBe(true);
    });

    it("retorna false si no existe hce_token", () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });
});
