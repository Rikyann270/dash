import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SidebarSupportCard() {
  return (
    <Card size="sm" className="shadow-none group-data-[collapsible=icon]:hidden">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Looking for something more?</CardTitle>
        <CardDescription>Reach out to the NCC administrator for support.</CardDescription>
      </CardHeader>
    </Card>
  );
}
