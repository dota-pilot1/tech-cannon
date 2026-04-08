import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { CustomButton } from "@/shared/ui/custom-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { authActions } from "@/entities/user/model/authStore";
import { authApi } from "@/entities/user/api/authApi";
import { useQueryClient } from "@tanstack/react-query";
import { getRolesFromToken, getAuthoritiesFromToken } from "@/shared/lib/jwt";

export function LoginForm() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
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
      setOpen(false);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <CustomButton borderColor="white" textColor="white" variant="ghost">
          로그인
        </CustomButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>로그인</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="login-email">이메일</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">비밀번호</Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
