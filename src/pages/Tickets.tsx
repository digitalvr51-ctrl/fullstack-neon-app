import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Ticket,
  ShoppingCart,
  Calendar,
  MapPin,
  CreditCard,
  Copy,
  CheckCircle,
  Music,
  Users,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

export default function Tickets() {
  const utils = trpc.useUtils();
  const { data: info, isLoading } = trpc.ticket.info.useQuery();

  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [orderResult, setOrderResult] = useState<{
    id: number;
    variableSymbol: string;
    totalPrice: number;
    accountNumber: string;
    quantity: number;
  } | null>(null);

  const createOrder = trpc.ticket.createOrder.useMutation({
    onSuccess: (data) => {
      setOrderResult({
        id: data.id,
        variableSymbol: data.variableSymbol,
        totalPrice: data.totalPrice,
        accountNumber: data.accountNumber,
        quantity: data.quantity,
      });
      utils.ticket.info.invalidate();
      toast.success("Objednávka vytvořena!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!buyerName.trim()) {
      toast.error("Zadejte jméno");
      return;
    }
    createOrder.mutate({
      buyerName,
      buyerEmail: buyerEmail || undefined,
      buyerPhone: buyerPhone || undefined,
      quantity,
    });
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} zkopírováno!`);
    });
  }

  function resetForm() {
    setQuantity(1);
    setBuyerName("");
    setBuyerEmail("");
    setBuyerPhone("");
    setOrderResult(null);
    setIsOpen(false);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fuchsia-950 via-purple-950 to-indigo-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
      </div>
    );
  }

  const availableTickets = info?.available ?? 0;
  const isSoldOut = availableTickets <= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-950 via-purple-950 to-indigo-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Beat For Love
            </h1>
            <p className="text-purple-200 text-sm">Vstupenky na festival</p>
          </div>
        </div>

        {/* Hero Card */}
        <Card className="mb-8 bg-white/10 backdrop-blur-md border-white/20 text-white overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600/30 via-purple-600/30 to-cyan-600/30" />
            <CardContent className="relative p-8">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Music className="h-6 w-6 text-pink-400" />
                    <span className="text-lg font-semibold text-pink-300">Jednodenní vstupenka</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-200">
                    <Calendar className="h-4 w-4" />
                    <span>Letní festivalová sezóna 2026</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-200">
                    <MapPin className="h-4 w-4" />
                    <span>Žďár nad Sázavou</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-200">
                    <Users className="h-4 w-4" />
                    <span>Celkem {info?.total ?? 73} vstupenek</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-white">
                    {(info?.price ?? 2200).toLocaleString("cs-CZ")}
                    <span className="text-2xl text-purple-300 ml-1">Kč</span>
                  </div>
                  <p className="text-purple-300 mt-1">za kus</p>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Availability */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-300 font-normal">Zbývá vstupenek</CardTitle>
              <div className="text-4xl font-bold text-white">{availableTickets}</div>
            </CardHeader>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-300 font-normal">Prodáno</CardTitle>
              <div className="text-4xl font-bold text-pink-400">{info?.sold ?? 0}</div>
            </CardHeader>
          </Card>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-purple-300 mb-2">
            <span>Prodej vstupenek</span>
            <span>{info?.total ? Math.round(((info.sold ?? 0) / info.total) * 100) : 0}%</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{
                width: `${info?.total ? ((info.sold ?? 0) / info.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Purchase Button */}
        <Button
          onClick={() => setIsOpen(true)}
          disabled={isSoldOut}
          className="w-full h-16 text-xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-700 hover:via-purple-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSoldOut ? (
            "Vyprodáno"
          ) : (
            <>
              <ShoppingCart className="h-6 w-6 mr-3" />
              Zakoupit vstupenku
            </>
          )}
        </Button>

        {/* Purchase Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="bg-slate-900 border-purple-500/30 text-white max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-center bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {orderResult ? "Potvrzení objednávky" : "Zakoupit vstupenky"}
              </DialogTitle>
              <DialogDescription className="text-center text-purple-300">
                {orderResult
                  ? "Dokončete platbu převodem na účet"
                  : "Beat For Love - Jednodenní vstupenka"}
              </DialogDescription>
            </DialogHeader>

            {!orderResult ? (
              <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                {/* Quantity */}
                <div>
                  <label className="text-sm font-medium text-purple-200 mb-2 block">
                    Počet vstupenek
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="border-purple-500/30 text-white hover:bg-purple-500/20"
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      max={availableTickets}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.min(
                            availableTickets,
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        )
                      }
                      className="text-center text-xl font-bold bg-white/10 border-purple-500/30 text-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setQuantity(Math.min(availableTickets, quantity + 1))}
                      className="border-purple-500/30 text-white hover:bg-purple-500/20"
                    >
                      +
                    </Button>
                  </div>
                  <p className="text-xs text-purple-400 mt-1">
                    Maximum {availableTickets} vstupenek na objednávku
                  </p>
                </div>

                {/* Total Price */}
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <span className="text-purple-300">Celkem k úhradě:</span>
                  <div className="text-3xl font-bold text-white mt-1">
                    {((info?.price ?? 2200) * quantity).toLocaleString("cs-CZ")} Kč
                  </div>
                </div>

                <Separator className="bg-purple-500/20" />

                {/* Personal Info */}
                <div>
                  <label className="text-sm font-medium text-purple-200 mb-1 block">
                    Jméno a příjmení *
                  </label>
                  <Input
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Jan Novák"
                    required
                    className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-purple-200 mb-1 block">
                    E-mail
                  </label>
                  <Input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="jan@example.com"
                    className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-purple-200 mb-1 block">
                    Telefon
                  </label>
                  <Input
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="+420 123 456 789"
                    className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400/50"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createOrder.isPending}
                  className="w-full h-12 text-lg font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-700 hover:via-purple-700 hover:to-cyan-700"
                >
                  {createOrder.isPending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <Ticket className="h-5 w-5 mr-2" />
                      Vytvořit objednávku
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-5 mt-4">
                {/* Payment Info */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-green-300">Objednávka č. {orderResult.id}</p>
                    <p className="text-sm text-green-200/70">vytvořena úspěšně</p>
                  </div>
                </div>

                <div className="space-y-3 bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="text-purple-300">Počet vstupenek:</span>
                    <span className="font-bold">{orderResult.quantity} ks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300">Celkem:</span>
                    <span className="font-bold text-xl">
                      {orderResult.totalPrice.toLocaleString("cs-CZ")} Kč
                    </span>
                  </div>
                </div>

                <Separator className="bg-purple-500/20" />

                <div className="space-y-3">
                  <h4 className="font-semibold text-purple-200 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Platební údaje
                  </h4>

                  {/* Account Number */}
                  <div
                    className="bg-white/5 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => copyToClipboard(orderResult.accountNumber, "Číslo účtu")}
                  >
                    <div>
                      <p className="text-xs text-purple-400">Číslo účtu</p>
                      <p className="font-mono text-lg font-bold">{orderResult.accountNumber}</p>
                    </div>
                    <Copy className="h-4 w-4 text-purple-400" />
                  </div>

                  {/* Variable Symbol */}
                  <div
                    className="bg-white/5 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => copyToClipboard(orderResult.variableSymbol, "Variabilní symbol")}
                  >
                    <div>
                      <p className="text-xs text-purple-400">Variabilní symbol</p>
                      <p className="font-mono text-lg font-bold text-pink-400">
                        {orderResult.variableSymbol}
                      </p>
                    </div>
                    <Copy className="h-4 w-4 text-purple-400" />
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-200">
                  Pro dokončení nákupu proveďte převod na uvedený účet s variabilním symbolem.
                  Vstupenky budou zaslány na váš e-mail po přijetí platby.
                </div>

                <Button
                  onClick={resetForm}
                  className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-700 hover:via-purple-700 hover:to-cyan-700"
                >
                  Zavřít
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="text-center text-sm text-purple-400 mt-12 pb-8">
          Beat For Love Festival 2026
        </div>
      </div>
    </div>
  );
}
