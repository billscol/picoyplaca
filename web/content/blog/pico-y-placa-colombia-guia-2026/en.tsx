import { Link } from "@/navigation";
import { H2, H3, P, Ul, Li, Callout, TableWrap } from "@/components/marketing/blog-prose";

export default function Body() {
  return (
    <>
      <P>
        <strong>Pico y placa</strong> is a private-vehicle circulation restriction that most of Colombia’s
        largest cities enforce, each with its own rules. The idea is always the same — fewer cars on the road
        during peak congestion hours — but the restricted day and plate digit vary from city to city, and not
        every city runs it year-round. This guide brings together how it works in Bogotá, Medellín, Cali,
        Bucaramanga, Cartagena and Barranquilla.
      </P>

      <H2>What every city has in common</H2>
      <Ul>
        <Li>It restricts <strong>private vehicles</strong> based on the last digit of the plate (motorcycles, taxis and public transport usually follow different rules or are exempt).</Li>
        <Li>The fine for breaking it is <strong>15 SMLDV</strong> (daily legal minimum wage units) with vehicle impoundment, based on Art. 131-C.14 of Law 769 of 2002 (amended by art. 21 of Law 1383 of 2010) — the same national rule across all six cities we checked.</Li>
        <Li><strong>Electric and hybrid vehicles</strong> are exempt in every active city.</Li>
        <Li>The restriction is normally <strong>suspended on public holidays</strong> (Barranquilla is the exception, but only because it currently has no active restriction for private vehicles — see below).</Li>
      </Ul>

      <H2>City by city</H2>

      <H3>Bogotá</H3>
      <P>
        Rotates Monday to Friday, 6:00 a.m. to 9:00 p.m., by digit pairs. Besides electric and hybrid, it also
        exempts <strong>motorcycles</strong>. Check today’s exact digit on{" "}
        <Link href={{ pathname: "/ciudades/[slug]", params: { slug: "bogota" } }} className="font-semibold text-foreground underline">
          Bogotá’s page
        </Link>
        .
      </P>

      <H3>Medellín</H3>
      <P>
        The rotation is updated per semester (the current one runs from February). It also exempts{" "}
        <strong>compressed natural gas (CNG)</strong> vehicles besides electric and hybrid. Check today’s
        restricted digit on{" "}
        <Link href={{ pathname: "/ciudades/[slug]", params: { slug: "medellin" } }} className="font-semibold text-foreground underline">
          Medellín’s page
        </Link>
        .
      </P>

      <H3>Cali</H3>
      <P>
        Also rotates every semester. Exempts electric, hybrid, <strong>motorcycles</strong>, and vehicles driven
        by or for people with a <strong>disability</strong>. See the current schedule on{" "}
        <Link href={{ pathname: "/ciudades/[slug]", params: { slug: "cali" } }} className="font-semibold text-foreground underline">
          Cali’s page
        </Link>
        .
      </P>

      <H3>Bucaramanga</H3>
      <P>
        Rotates quarterly. Exempts electric, hybrid and <strong>CNG</strong> vehicles. Besides the weekday
        restriction, the official source also reports an additional Saturday restriction with weekly-rotating
        digits — always check the official source before a specific Saturday. Full detail on{" "}
        <Link href={{ pathname: "/ciudades/[slug]", params: { slug: "bucaramanga" } }} className="font-semibold text-foreground underline">
          Bucaramanga’s page
        </Link>
        .
      </P>

      <H3>Cartagena</H3>
      <P>
        Runs <strong>two time windows per day</strong> (morning and evening) instead of one continuous block.
        Exempts electric, hybrid and disability vehicles. Check the exact windows on{" "}
        <Link href={{ pathname: "/ciudades/[slug]", params: { slug: "cartagena" } }} className="font-semibold text-foreground underline">
          Cartagena’s page
        </Link>
        .
      </P>

      <H3>Barranquilla</H3>
      <P>
        The exception on this list: it currently has <strong>no active pico y placa for private vehicles</strong> —
        it was repealed by district decree. It still applies to other categories on some corridors. Check the
        current status on{" "}
        <Link href={{ pathname: "/ciudades/[slug]", params: { slug: "barranquilla" } }} className="font-semibold text-foreground underline">
          Barranquilla’s page
        </Link>
        .
      </P>

      <H2>Quick comparison table</H2>
      <TableWrap>
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-xs font-semibold uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">City-specific exemptions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr><td className="px-4 py-3 font-semibold">Bogotá</td><td className="px-4 py-3 text-muted-foreground">Active</td><td className="px-4 py-3 text-muted-foreground">Motorcycles</td></tr>
            <tr><td className="px-4 py-3 font-semibold">Medellín</td><td className="px-4 py-3 text-muted-foreground">Active</td><td className="px-4 py-3 text-muted-foreground">CNG</td></tr>
            <tr><td className="px-4 py-3 font-semibold">Cali</td><td className="px-4 py-3 text-muted-foreground">Active</td><td className="px-4 py-3 text-muted-foreground">Motorcycles, disability</td></tr>
            <tr><td className="px-4 py-3 font-semibold">Bucaramanga</td><td className="px-4 py-3 text-muted-foreground">Active</td><td className="px-4 py-3 text-muted-foreground">CNG</td></tr>
            <tr><td className="px-4 py-3 font-semibold">Cartagena</td><td className="px-4 py-3 text-muted-foreground">Active (2 windows/day)</td><td className="px-4 py-3 text-muted-foreground">Disability</td></tr>
            <tr><td className="px-4 py-3 font-semibold">Barranquilla</td><td className="px-4 py-3 text-muted-foreground">Not in force (private)</td><td className="px-4 py-3 text-muted-foreground">—</td></tr>
          </tbody>
        </table>
      </TableWrap>

      <Callout>
        Rotations and effective dates change by decree several times a year — this guide summarizes the
        general patterns. For today’s exact digit and the official source behind each rule, visit each city’s
        page or check{" "}
        <Link href={{ pathname: "/ciudades/pais/[country]", params: { country: "colombia" } }} className="font-semibold underline">
          the Colombia cities overview
        </Link>
        .
      </Callout>

      <H2>Need this data in your app or system?</H2>
      <P>
        Everything in this guide comes from the same API that powers these pages. If you’re building an app,
        a fleet system, or any product that needs to check current pico y placa status by plate or by city,
        take a look at{" "}
        <Link href="/precios" className="font-semibold text-foreground underline">
          the API plans
        </Link>
        .
      </P>
    </>
  );
}
