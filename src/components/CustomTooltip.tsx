import { Card, CardContent } from "@/components/ui/card"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Card>
        <CardContent className="p-2">
          <p className="label">{`${label} : ${payload[0].value}`}</p>
          {payload.map((pld: any, index: number) => (
            <p key={index} style={{ color: pld.color }}>
              {pld.name} : {pld.value}
            </p>
          ))}
        </CardContent>
      </Card>
    )
  }

  return null
}

export default CustomTooltip