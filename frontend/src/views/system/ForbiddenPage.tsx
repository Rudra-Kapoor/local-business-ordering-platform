import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Access denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-slate-700">
            You don’t have permission to view this page with your current account.
          </div>
          <Link to="/">
            <Button variant="secondary">Go to home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

