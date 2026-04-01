import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ClipboardList } from 'lucide-react'

export default function Scanner() {
  const navigate = useNavigate()

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold">Scanner QR</h2>
      <Card>
        <CardContent className="pt-6 space-y-4 text-center">
          <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Per scansionare i prodotti, apri un ordine e avvia il picking.
          </p>
          <Button className="w-full" onClick={() => navigate('/orders')}>
            Vai agli ordini
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
