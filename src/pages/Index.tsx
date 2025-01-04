import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Budget App</h1>
        <p className="text-xl text-gray-600 mb-8">Start managing your finances!</p>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Index;