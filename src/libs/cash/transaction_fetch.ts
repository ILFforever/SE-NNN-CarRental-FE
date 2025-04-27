import { API_BASE_URL } from "@/config/apiConfig";

interface TransactionProps {
  token: string;
  roles: "user" | "admin";
  filter?: {
    type?: "deposit" | "withdrawal" | "payment" | "refund";
    status?: string;
    startDate?: string;
    endDate?: string;
    reference?: string;
    rentalId?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
  };
  pagination?: {
    page?: number;
    limit?: number;
  };
}

const HelperUrlFromProps = (props: TransactionProps) => {
  let URL: string = "";
  if (props.filter) {
    Object.keys(props.filter).forEach((key) => {
      if (
        props.filter &&
        props.filter[key as keyof TransactionProps["filter"]]
      ) {
        URL += `${key}=${
          props.filter[key as keyof TransactionProps["filter"]]
        }&`;
      }
    });
  }
  URL = URL.substring(0, URL.length - 1);
  if (props.pagination) {
    URL += "&";
    Object.keys(props.pagination).forEach((key) => {
      if (
        props.pagination &&
        props.pagination[key as keyof TransactionProps["pagination"]]
      ) {
        URL += `${key}=${
          props.pagination[key as keyof TransactionProps["pagination"]]
        }&`;
      }
    });
  }
  return URL.substring(0, URL.length - 1);
};

export interface TransactionResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    prev?: {
      page: number;
      limit: number;
    };
    next?: {
      page: number;
      limit: number;
    };
  };
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
    withdrawals: {
      count: number;
      total: number;
    };
    netFlow: number;
  };
  data: {
    currentCredits: number;
    transactions: Array<any>;
  };
}

export default async function TransactionFetch(
  props: TransactionProps
): Promise<TransactionResponse> {
  let URL = API_BASE_URL;
  // API Endpoint that's pointed to assosicated path
  if (props.roles === "admin") {
    URL += "/credits/transactions?";
  } else {
    URL += "/credits/history?";
  }

  // Add filter parameters to the URL if they exist
  URL += HelperUrlFromProps(props);

  const response = await fetch(URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${props.token}`,
    },
  });

  if (response.status !== 200) {
    console.error("Error fetching transactions:", response.statusText);
    throw new Error("Failed to fetch transactions");
  }

  return response.json();
}
