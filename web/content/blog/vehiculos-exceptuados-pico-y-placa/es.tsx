import { Link } from "@/navigation";
import { H2, H3, P, Ul, Li, Callout, TableWrap } from "@/components/marketing/blog-prose";

export default function Body() {
  return (
    <>
      <P>
        Si tu carro está exceptuado del pico y placa, no aplica ninguna restricción de dígito ni horario para
        vos — pero <strong>qué cuenta como “exceptuado” no es lo mismo en todas las ciudades</strong>. Esta guía
        junta las excepciones que reportan las fuentes oficiales de Bogotá, Medellín, Cali, Bucaramanga y
        Cartagena para vehículos particulares.
      </P>

      <H2>Lo que se exceptúa en todas partes: eléctricos e híbridos</H2>
      <P>
        Los <strong>vehículos eléctricos</strong> e <strong>híbridos</strong> están exceptuados del pico y placa
        de vehículos particulares en las cinco ciudades colombianas con restricción activa que revisamos
        (Bogotá, Medellín, Cali, Bucaramanga y Cartagena). Es la única excepción verdaderamente universal en
        este grupo de ciudades.
      </P>

      <H2>Excepciones que solo aplican en algunas ciudades</H2>

      <H3>Motocicletas</H3>
      <P>
        Exceptuadas explícitamente en <strong>Bogotá</strong> y <strong>Cali</strong>. En el resto de ciudades
        de esta lista las motos generalmente no están cubiertas por el pico y placa de particulares porque
        tienen su propia categoría de restricción — pero eso no es lo mismo que decir que “no aplica nada”:
        confirma siempre la categoría de moto en la página de tu ciudad.
      </P>

      <H3>Gas natural vehicular (GNV)</H3>
      <P>
        Exceptuados en <strong>Medellín</strong> y <strong>Bucaramanga</strong>. No aparece como excepción
        explícita en Bogotá, Cali o Cartagena para la categoría de particulares.
      </P>

      <H3>Vehículos de personas con discapacidad</H3>
      <P>
        Exceptuados en <strong>Cali</strong> y <strong>Cartagena</strong>. Si conduces o eres pasajero
        habitual de un vehículo registrado para una persona con discapacidad, revisa si tu ciudad lo incluye.
      </P>

      <TableWrap>
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-xs font-semibold uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Ciudad</th>
              <th className="px-4 py-3">Eléctricos / híbridos</th>
              <th className="px-4 py-3">Motos</th>
              <th className="px-4 py-3">GNV</th>
              <th className="px-4 py-3">Discapacidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr>
              <td className="px-4 py-3 font-semibold">Bogotá</td>
              <td className="px-4 py-3 text-muted-foreground">Sí</td>
              <td className="px-4 py-3 text-muted-foreground">Sí</td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-semibold">Medellín</td>
              <td className="px-4 py-3 text-muted-foreground">Sí</td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
              <td className="px-4 py-3 text-muted-foreground">Sí</td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-semibold">Cali</td>
              <td className="px-4 py-3 text-muted-foreground">Sí</td>
              <td className="px-4 py-3 text-muted-foreground">Sí</td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
              <td className="px-4 py-3 text-muted-foreground">Sí</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-semibold">Bucaramanga</td>
              <td className="px-4 py-3 text-muted-foreground">Sí</td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
              <td className="px-4 py-3 text-muted-foreground">Sí</td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-semibold">Cartagena</td>
              <td className="px-4 py-3 text-muted-foreground">Sí</td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
              <td className="px-4 py-3 text-muted-foreground">Sí</td>
            </tr>
          </tbody>
        </table>
      </TableWrap>

      <Callout>
        Un “—” en la tabla significa que la fuente oficial de esa ciudad no reporta esa excepción para
        vehículos particulares — no necesariamente que esté prohibida, solo que no está listada. Si tu caso no
        está claro, la única forma de confirmarlo es con la fuente oficial de tu ciudad, enlazada desde cada
        página de ciudad.
      </Callout>

      <H2>¿Y si mi vehículo no está en ninguna de estas categorías?</H2>
      <P>
        Entonces el pico y placa aplica normalmente según el último dígito de tu placa y el horario vigente en
        tu ciudad. Usa el buscador por placa en la página de tu ciudad para ver exactamente qué día te
        restringe:
      </P>
      <Ul>
        <Li><Link href={{ pathname: "/ciudades/[slug]", params: { slug: "bogota" } }} className="font-semibold text-foreground underline">Bogotá</Link></Li>
        <Li><Link href={{ pathname: "/ciudades/[slug]", params: { slug: "medellin" } }} className="font-semibold text-foreground underline">Medellín</Link></Li>
        <Li><Link href={{ pathname: "/ciudades/[slug]", params: { slug: "cali" } }} className="font-semibold text-foreground underline">Cali</Link></Li>
        <Li><Link href={{ pathname: "/ciudades/[slug]", params: { slug: "bucaramanga" } }} className="font-semibold text-foreground underline">Bucaramanga</Link></Li>
        <Li><Link href={{ pathname: "/ciudades/[slug]", params: { slug: "cartagena" } }} className="font-semibold text-foreground underline">Cartagena</Link></Li>
      </Ul>

      <P>
        Para el panorama completo de las seis ciudades colombianas, incluida Barranquilla (sin restricción
        vigente), revisa{" "}
        <Link href={{ pathname: "/ciudades/pais/[country]", params: { country: "colombia" } }} className="font-semibold text-foreground underline">
          la guía de todas las ciudades de Colombia
        </Link>
        .
      </P>
    </>
  );
}
