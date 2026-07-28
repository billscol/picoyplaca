import { Link } from "@/navigation";
import { H2, P, Ul, Li, Callout } from "@/components/marketing/blog-prose";

export default function Body() {
  return (
    <>
      <P>
        Driving your private car during a pico y placa restricted hour and digit has both a financial and an
        operational consequence. Here’s what the official sources of Bogotá, Medellín, Cali, Bucaramanga and
        Cartagena say — and it’s the exact same rule across all five.
      </P>

      <H2>How much is the fine?</H2>
      <P>
        The fine is <strong>15 SMLDV</strong> (daily legal minimum wage units) in all five Colombian cities
        with an active pico y placa that we checked. The peso amount depends on the current year’s minimum
        wage — since it changes every January 1st, we don’t fix it here to avoid going stale; check the
        current year’s SMLDV and multiply by 15, or check your city’s official source for the already
        calculated amount.
      </P>

      <H2>What’s the legal basis?</H2>
      <P>
        All five cities cite the same national basis:{" "}
        <strong>Art. 131-C.14 of Law 769 of 2002 (National Traffic Code), amended by art. 21 of Law 1383 of
        2010</strong>. It’s a national rule, not a municipal one — what varies between cities is the schedule
        and restricted digit, not the fine amount or the article behind it.
      </P>

      <H2>What happens besides the fine?</H2>
      <P>
        All five official sources report the same additional consequence:{" "}
        <strong>vehicle impoundment</strong>. That means, on top of the fine’s monetary value, the car can be
        towed and held — with towing and storage costs that are separate from the fine itself.
      </P>

      <Callout>
        This summarizes what each city’s official source reports at the time of writing this guide. Traffic
        rules change; before any important decision, verify the exact current amount directly with the
        official source linked from your city’s page.
      </Callout>

      <H2>How do I avoid the fine?</H2>
      <Ul>
        <Li>Check your city’s restricted digit and hours <strong>before you leave</strong>, not once you’re already on the road.</Li>
        <Li>If your vehicle is electric, hybrid, or falls into one of your city’s exempt categories, confirm it — you may not need to worry.</Li>
        <Li>Remember the restriction is normally <strong>suspended on public holidays</strong> in most of these cities, but confirm it for your specific city before a given holiday.</Li>
        <Li>If you’re unsure about your vehicle category (motorcycle, taxi, special transport), those usually follow different rules than private vehicles — don’t assume the same rules apply.</Li>
      </Ul>

      <P>
        Check today’s pico y placa status, by plate, in any of these cities:{" "}
        <Link href={{ pathname: "/ciudades/[slug]", params: { slug: "bogota" } }} className="font-semibold text-foreground underline">Bogotá</Link>,{" "}
        <Link href={{ pathname: "/ciudades/[slug]", params: { slug: "medellin" } }} className="font-semibold text-foreground underline">Medellín</Link>,{" "}
        <Link href={{ pathname: "/ciudades/[slug]", params: { slug: "cali" } }} className="font-semibold text-foreground underline">Cali</Link>,{" "}
        <Link href={{ pathname: "/ciudades/[slug]", params: { slug: "bucaramanga" } }} className="font-semibold text-foreground underline">Bucaramanga</Link>{" "}
        or{" "}
        <Link href={{ pathname: "/ciudades/[slug]", params: { slug: "cartagena" } }} className="font-semibold text-foreground underline">Cartagena</Link>
        . Or check{" "}
        <Link href={{ pathname: "/ciudades/pais/[country]", params: { country: "colombia" } }} className="font-semibold text-foreground underline">
          all of Colombia’s cities
        </Link>{" "}
        in one place.
      </P>
    </>
  );
}
