import { auth } from "@/auth";
import { redirect } from "next/navigation";
import GenerateForm from "./GenerateForm";

export const metadata = { title: "Generate" };

const GeneratePage = async () => {
  const session = await auth();
  if (!session) redirect("/");

  return <GenerateForm />;
};

export default GeneratePage;
