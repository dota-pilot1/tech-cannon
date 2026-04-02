import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { CustomInput } from "@/shared/ui/custom-input";
import { CustomButton } from "@/shared/ui/custom-button";
import { authActions } from "@/entities/user/model/authStore";
import { authApi } from "@/entities/user/api/authApi";
import { useQueryClient } from "@tanstack/react-query";
import { getRolesFromToken, getAuthoritiesFromToken } from "@/shared/lib/jwt";

export function LoginForm() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("terecal@daum.net");
  const [password, setPassword] = useState("password123!");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });

      const roles = getRolesFromToken(response.accessToken);
      const authorities = getAuthoritiesFromToken(response.accessToken);

      // 먼저 토큰 저장 (getCurrentUser 호출 전에 필요)
      authActions.login(response.accessToken, response.refreshToken, {
        id: response.userId,
        email: response.email,
        username: response.username,
        role: response.role,
        roles,
        authorities,
      });

      queryClient.invalidateQueries({ queryKey: ["menus"] });

      setEmail("");
      setPassword("");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <CustomInput
        id="email"
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        borderColor="white"
        bgColor="rgba(255,255,255,0.1)"
        textColor="white"
      />

      <CustomInput
        id="password"
        type={showPassword ? "text" : "password"}
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        borderColor="white"
        bgColor="rgba(255,255,255,0.1)"
        textColor="white"
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-white/60 hover:text-white"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        }
      />

      <CustomButton
        type="submit"
        disabled={isLoading}
        borderColor="white"
        textColor="white"
        variant="ghost"
      >
        {isLoading ? "로그인 중..." : "로그인"}
      </CustomButton>

      {error && <span className="text-sm text-red-400">{error}</span>}
    </form>
  );
}
