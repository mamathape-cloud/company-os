import { CircularProgress } from "@mui/material";

export default function LoadingSpinner({ fullPage = false }: { fullPage?: boolean }) {
  return (
    <div className={`flex items-center justify-center ${fullPage ? "min-h-screen" : "min-h-[160px]"}`}>
      <CircularProgress color="primary" />
    </div>
  );
}
