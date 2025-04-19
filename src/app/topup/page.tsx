"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

// Define bonus package type
type BonusPackage = {
  id: string;
  title: string;
  description: string;
  amount: number;
  bonusPercent: number;
  image: string;
};

// Preset bonus packages
const bonusPackages: BonusPackage[] = [
  {
    id: "starter",
    title: "Starter Pack",
    description: "+10% bonus",
    amount: 200,
    bonusPercent: 10,
    image:
      "https://images.unsplash.com/photo-1607798421660-7d2c0bcff934?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "value",
    title: "Value Pack",
    description: "+12% bonus",
    amount: 500,
    bonusPercent: 12,
    image:
      "https://images.unsplash.com/photo-1607798421660-7d2c0bcff934?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "premium",
    title: "Premium Pack",
    description: "+15% bonus",
    amount: 1000,
    bonusPercent: 15,
    image:
      "https://images.unsplash.com/photo-1607798421660-7d2c0bcff934?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export default function TopUpPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [selectedPkg, setSelectedPkg] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<number>(0);

  const [amount, setAmount] = useState<number>(0);
  const [totalCredit, setTotalCredit] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (selectedPkg) {
      const pkg = bonusPackages.find((p) => p.id === selectedPkg)!;
      setAmount(pkg.amount);
      setError(null);
      const bonus = Math.floor((pkg.amount * pkg.bonusPercent) / 100);
      setTotalCredit(pkg.amount + bonus);
    } else {
      setAmount(customAmount);
      if (customAmount < 100) {
        setError("Minimum top-up is $100");
        setTotalCredit(0);
      } else {
        setError(null);
        let pct = 0;
        if (customAmount >= 1000) pct = 10;
        else if (customAmount >= 500) pct = 5;
        const bonus = Math.floor((customAmount * pct) / 100);
        setTotalCredit(customAmount + bonus);
      }
    }
  }, [selectedPkg, customAmount]);

  if (!session) {
    return (
      <div className="py-10 px-4 max-w-md mx-auto text-center">
        <Typography variant="h6" color="warning.main" gutterBottom>
          Please sign in to top up your account.
        </Typography>
        <Link href="/signin?callbackUrl=/account/topup" passHref>
          <Button variant="contained" color="primary">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  const handleConfirm = () => {
    if (error || amount < 100) return;
    setLoading(true);
    router.push(
      `/account/topup/confirm?amount=${amount}&credit=${totalCredit}`
    );
  };

  return (
    <main className="py-8 px-4 max-w-lg mx-auto">
      <Typography variant="h4" component="h1" gutterBottom>
        Account Top-Up
      </Typography>

      {/* Package Cards */}
      <Typography variant="h6" gutterBottom>
        Choose a Bonus Package
      </Typography>
      <Grid container spacing={2} mb={16} className="w-screen">
        {bonusPackages.map((pkg) => {
          const isSelected = selectedPkg === pkg.id;
          return (
            <Grid item xs={12} sm={6} key={pkg.id}>
              <Card
                onClick={() => setSelectedPkg(pkg.id)}
                sx={{
                  border: isSelected ? 2 : 1,
                  borderColor: isSelected ? "primary.main" : "grey.300",
                  cursor: "pointer",
                }}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={pkg.image}
                  alt={pkg.title}
                />
                <CardContent>
                  <Typography variant="h6">{pkg.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pkg.description}
                  </Typography>
                  <Typography variant="body1" mt={1}>
                    ${pkg.amount}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => setSelectedPkg(pkg.id)}>
                    Select
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Divider between package and custom */}
      <Divider sx={{ mb: 4 }}>Or Enter Custom Amount</Divider>

      {/* Custom Amount Input */}
      <div className="mb-6">
        <Typography variant="subtitle1" gutterBottom>
          Custom Amount ($)
        </Typography>
        <input
          type="number"
          min={0}
          value={customAmount}
          onChange={(e) => {
            setSelectedPkg("");
            setCustomAmount(Number(e.target.value));
          }}
          placeholder="Minimum $100"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {error && (
          <Typography variant="caption" color="error">
            {error}
          </Typography>
        )}
      </div>

      {/* Summary */}
      {amount >= 100 && (
        <Card
          variant="outlined"
          sx={{ mb: 4, p: 2, backgroundColor: "grey.50" }}
        >
          <Typography>
            Top-Up Amount: <strong>${amount}</strong>
          </Typography>
          <Typography>
            Bonus Credit: <strong>${totalCredit - amount}</strong>
          </Typography>
          <Typography>
            Total Credit: <strong>${totalCredit}</strong>
          </Typography>
        </Card>
      )}

      {/* Confirm Button */}
      <Button
        fullWidth
        variant="contained"
        color="primary"
        disabled={!!error || loading}
        onClick={handleConfirm}
      >
        {loading ? "Processing…" : "Confirm Top-Up"}
      </Button>
    </main>
  );
}
