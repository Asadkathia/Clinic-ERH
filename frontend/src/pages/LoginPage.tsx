import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { useAuth } from "../lib/auth/auth-context";

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("Reception User");
  const [role, setRole] = useState<"admin" | "receptionist">("receptionist");

  return (
    <div className="container" style={{ padding: "60px 0", maxWidth: 520 }}>
      <Card>
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            signIn(name, role);
            navigate("/crm/dashboard");
          }}
        >
          <h2>CRM Login</h2>
          <label className="stack" style={{ gap: 8 }}>
            Name
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="stack" style={{ gap: 8 }}>
            Role
            <Select value={role} onChange={(e) => setRole(e.target.value as "admin" | "receptionist")}>
              <option value="receptionist">Receptionist</option>
              <option value="admin">Admin</option>
            </Select>
          </label>
          <Button type="submit">Sign in</Button>
        </form>
      </Card>
    </div>
  );
}

