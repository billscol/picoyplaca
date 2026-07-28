import { Link } from "@/navigation";
import { H2, H3, P, Ul, Li, Callout, TableWrap } from "@/components/marketing/blog-prose";

export default function Body() {
  return (
    <>
      <P>
        If your car is exempt from pico y placa, no digit or hour restriction applies to you — but{" "}
        <strong>what counts as “exempt” isn’t the same in every city</strong>. This guide brings together the
        exemptions reported by the official sources of Bogotá, Medellín, Cali, Bucaramanga and Cartagena for
        private vehicles.
      </P>

      <H2>Exempt everywhere: electric and hybrid</H2>
      <P>
        <strong>Electric</strong> and <strong>hybrid</strong> vehicles are exempt from the private-vehicle
        pico y placa in all five Colombian cities with an active restriction that we checked (Bogotá,
        Medellín, Cali, Bucaramanga and Cartagena). It’s the only truly universal exemption across this group
        of cities.
      </P>

      <H2>Exemptions that only apply in some cities</H2>

      <H3>Motorcycles</H3>
      <P>
        Explicitly exempt in <strong>Bogotá</strong> and <strong>Cali</strong>. In the other cities on this
        list, motorcycles generally aren’t covered by the private-vehicle pico y placa because they have their
        own restriction category — but that’s not the same as “nothing applies”: always confirm the
        motorcycle category on your city’s page.
      </P>

      <H3>Compressed natural gas (CNG)</H3>
      <P>
        Exempt in <strong>Medellín</strong> and <strong>Bucaramanga</strong>. Not listed as an explicit
        exemption in Bogotá, Cali or Cartagena for the private-vehicle category.
      </P>

      <H3>Vehicles for people with a disability</H3>
      <P>
        Exempt in <strong>Cali</strong> and <strong>Cartagena</strong>. If you drive or regularly ride in a
        vehicle registered for a person with a disability, check whether your city includes it.
      </P>

      <TableWrap>
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-xs font-semibold uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Electric / hybrid</th>
              <th className="px-4 py-3">Motorcycles</th>
              <th className="px-4 py-3">CNG</th>
              <th className="px-4 py-3">Disability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr>
              <td className="px-4 py-3 font-semibold">Bogotá</td>
              <td className="px-4 py-3 text-muted-foreground">Yes</td>
              <td className="px-4 py-3 text-muted-foreground">Yes</td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-semibold">Medellín</td>
              <td className="px-4 py-3 text-muted-foreground">Yes</td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
              <td className="px-4 py-3 text-muted-foreground">Yes</td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-semibold">Cali</td>
              <td className="px-4 py-3 text-muted-foreground">Yes</td>
              <td className="px-4 py-3 text-muted-foreground">Yes</td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
              <td className="px-4 py-3 text-muted-foreground">Yes</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-semibold">Bucaramanga</td>
              <td className="px-4 py-3 text-muted-foreground">Yes</td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
              <td className="px-4 py-3 text-muted-foreground">Yes</td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-semibold">Cartagena</td>
              <td className="px-4 py-3 text-muted-foreground">Yes</td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
              <td className="px-4 py-3 text-muted-foreground">—</td>
              <td className="px-4 py-3 text-muted-foreground">Yes</td>
            </tr>
          </tbody>
        </table>
      </TableWrap>

      <Callout>
        A “—” in the table means that city’s official source doesn’t report that exemption for private
        vehicles — not necessarily that it’s prohibited, just that it isn’t listed. If your case isn’t clear,
        the only way to confirm it is with your city’s official source, linked from each city page.
      </Callout>

      <H2>What if my vehicle doesn’t fit any of these categories?</H2>
      <P>
        Then pico y placa applies normally based on the last digit of your plate and your city’s current
        schedule. Use the plate lookup on your city’s page to see exactly which day restricts you:
      </P>
      <Ul>
        <Li><Link href={{ pathname: "/ciudades/[slug]", params: { slug: "bogota" } }} className="font-semibold text-foreground underline">Bogotá</Link></Li>
        <Li><Link href={{ pathname: "/ciudades/[slug]", params: { slug: "medellin" } }} className="font-semibold text-foreground underline">Medellín</Link></Li>
        <Li><Link href={{ pathname: "/ciudades/[slug]", params: { slug: "cali" } }} className="font-semibold text-foreground underline">Cali</Link></Li>
        <Li><Link href={{ pathname: "/ciudades/[slug]", params: { slug: "bucaramanga" } }} className="font-semibold text-foreground underline">Bucaramanga</Link></Li>
        <Li><Link href={{ pathname: "/ciudades/[slug]", params: { slug: "cartagena" } }} className="font-semibold text-foreground underline">Cartagena</Link></Li>
      </Ul>

      <P>
        For the full picture across all six Colombian cities, including Barranquilla (no active restriction),
        check{" "}
        <Link href={{ pathname: "/ciudades/pais/[country]", params: { country: "colombia" } }} className="font-semibold text-foreground underline">
          the Colombia cities guide
        </Link>
        .
      </P>
    </>
  );
}
