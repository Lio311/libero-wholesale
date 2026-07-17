"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface SearchLogRow {
  id: string;
  query: string;
  hebrewTerm: string | null;
  englishTerm: string | null;
  resultsCount: number;
  timestamp: Date;
}

interface AnalyticsClientProps {
  logs: SearchLogRow[];
}

export function AnalyticsClient({ logs }: AnalyticsClientProps) {
  const missedSearches = logs.filter(log => log.resultsCount === 0);
  const totalSearches = logs.length;
  const successRate = totalSearches > 0 ? ((totalSearches - missedSearches.length) / totalSearches) * 100 : 0;

  // Group missed searches to find common missing terms
  const missedTermsMap = missedSearches.reduce((acc, log) => {
    const term = log.query.toLowerCase().trim();
    acc[term] = (acc[term] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const commonMissedTerms = Object.entries(missedTermsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">סה״כ חיפושים (30 ימים)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold">{totalSearches}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <Search className="h-3 w-3 ml-1" />
              חיפושים במערכת
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">חיפושים ללא תוצאות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-destructive">{missedSearches.length}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <AlertTriangle className="h-3 w-3 ml-1" />
              דורש עדכון מילון
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">אחוז הצלחת חיפוש</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold">{successRate.toFixed(1)}%</div>
            <p className={`text-xs mt-1 flex items-center ${successRate > 90 ? 'text-green-400' : 'text-orange-400'}`}>
              {successRate > 90 ? <TrendingUp className="h-3 w-3 ml-1" /> : <TrendingDown className="h-3 w-3 ml-1" />}
              {successRate > 90 ? 'מצוין' : 'דורש שיפור'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle>מונחים נפוצים ללא תוצאות</CardTitle>
            <CardDescription>כדאי להוסיף מונחים אלו למילון השגיאות</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border">
                  <TableHead className="text-right">מונח שחיפשו</TableHead>
                  <TableHead className="text-right">כמות חיפושים</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commonMissedTerms.length === 0 ? (
                  <TableRow className="border-border">
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-8">אין חיפושים ללא תוצאות</TableCell>
                  </TableRow>
                ) : (
                  commonMissedTerms.map(([term, count]) => (
                    <TableRow key={term} className="border-border hover:bg-muted/20">
                      <TableCell className="font-medium">{term}</TableCell>
                      <TableCell className="font-mono">{count}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle>לוג חיפושים אחרונים</CardTitle>
            <CardDescription>בדיקת מנוע התרגום והשגיאות</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border">
                  <TableHead className="text-right">חיפוש</TableHead>
                  <TableHead className="text-right">תרגום מנוע</TableHead>
                  <TableHead className="text-right">תוצאות</TableHead>
                  <TableHead className="text-right">זמן</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.slice(0, 10).map((log) => (
                  <TableRow key={log.id} className="border-border hover:bg-muted/20">
                    <TableCell className="font-medium">{log.query}</TableCell>
                    <TableCell className="text-muted-foreground">{log.englishTerm || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${log.resultsCount === 0 ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
                        {log.resultsCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {format(new Date(log.timestamp), "HH:mm dd/MM")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
