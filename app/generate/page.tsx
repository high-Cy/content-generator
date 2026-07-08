import { requirePageAccess } from "@/lib/access";
import GenerateForm from "./GenerateForm";

export const metadata = { title: "Generate" };

const GeneratePage = async () => {
  await requirePageAccess();

  return <GenerateForm />;
};

export default GeneratePage;
