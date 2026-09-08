import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function TrafficPage() {
  redirect("https://gctp.in/chennai-home");
}
