import { API_BASE_URL } from "@/config/apiConfig";

interface TransactionProps {
  token: string;
  roles: "User" | "Admin";
}

export interface TransactionResponse {
    success: boolean;
    count: number;
    total: number;
    pagination: Object;
    summary: {
        deposits: {
            count: number;
            total: number;
        };
        payments: {
            count: number;
            total: number;
        };
        refunds: {
            count: number;
            total: number;
        };
        withdrawls: {
            count: number;
            total: number;
        };
        netFlow: number;
    };
    data: {
        currentCredits: number;
        transactions: Array<any>
    }
}

export default async function TransactionFetch(
  props: TransactionProps
): Promise<TransactionResponse> {
  let URL = API_BASE_URL;
  // API Endpoint that's pointed to assosicated path
  if (props.roles === "Admin") {
    URL += "/credits/admin/transactions";
  } else {
    URL += "/credits/history";
  }
  console.log(URL);
  const response = await fetch(URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${props.token}`,
    },
  });

  if (response.status !== 200) {
    console.error("Error fetching transactions:", response.statusText);
    throw new Error("Failed to fetch transactions");
  }

  return response.json();
}
