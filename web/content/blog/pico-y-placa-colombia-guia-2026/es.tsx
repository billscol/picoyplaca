import { Link } from "@/navigation";
import { H2, H3, P, Ul, Li, Callout, TableWrap } from "@/components/marketing/blog-prose";

export default function Body() {
  return (
    <>
      <P>
        El <strong>pico y placa</strong> es una restricción a la circulación de vehículos particulares que
        aplican, con reglas propias, la mayoría de las grandes ciudades colombianas. La idea es siempre la
        misma — reducir el número de carros en las vías en las horas de mayor congestión — pero el día y el
        dígito de placa que te toca varían de una ciudad a otra, y no todas las ciudades lo aplican todo el
        año. Esta guía junta, en un solo lugar, cómo funciona en Bogotá, Medellín, Cali, Bucaramanga,
        Cartagena y Barranquilla.
      </P>

      <H2>Lo que todas las ciudades tienen en común</H2>
      <Ul>
        <Li>Restringe la circulación de <strong>vehículos particulares</strong> según el último dígito de la placa (motos, taxis y transporte público suelen tener reglas distintas o estar exceptuados).</Li>
        <Li>La multa por incumplirlo es de <strong>15 SMLDV</strong> (salarios mínimos legales diarios vigentes) con inmovilización del vehículo, con base en el Art. 131-C.14 de la Ley 769 de 2002 (modificado por el art. 21 de la Ley 1383 de 2010) — la misma norma nacional en las seis ciudades que revisamos.</Li>
        <Li>Los vehículos <strong>eléctricos e híbridos</strong> están exceptuados en todas las ciudades activas.</Li>
        <Li>La restricción normalmente <strong>se suspende en festivos</strong> (Barranquilla es la excepción, pero solo porque hoy no tiene pico y placa vigente para particulares — ver abajo).</Li>
      </Ul>

      <H2>Ciudad por ciudad</H2>

      <H3>Bogotá</H3>
      <P>
        Rota de lunes a viernes, de 6:00 a.m. a 9:00 p.m., por parejas de dígitos. Exceptúa además de eléctricos
        e híbridos a las <strong>motocicletas</strong>. Consulta el detalle exacto y el dígito de hoy en{" "}
        <Link href={{ pathname: "/ciudades/[slug]", params: { slug: "bogota" } }} className="font-semibold text-foreground underline">
          la página de Bogotá
        </Link>
        .
      </P>

      <H3>Medellín</H3>
      <P>
        La rotación se actualiza por semestre (la vigente en este momento corre desde febrero). Exceptúa,
        además de eléctricos e híbridos, a los vehículos a <strong>gas natural vehicular (GNV)</strong>. Verifica el
        dígito restringido hoy en{" "}
        <Link href={{ pathname: "/ciudades/[slug]", params: { slug: "medellin" } }} className="font-semibold text-foreground underline">
          la página de Medellín
        </Link>
        .
      </P>

      <H3>Cali</H3>
      <P>
        También rota semestralmente. Exceptúa eléctricos, híbridos, <strong>motocicletas</strong> y vehículos
        conducidos por o para personas con <strong>discapacidad</strong>. Mira el horario vigente en{" "}
        <Link href={{ pathname: "/ciudades/[slug]", params: { slug: "cali" } }} className="font-semibold text-foreground underline">
          la página de Cali
        </Link>
        .
      </P>

      <H3>Bucaramanga</H3>
      <P>
        Rotación trimestral. Exceptúa eléctricos, híbridos y vehículos a <strong>gas natural vehicular</strong>.
        Además del pico y placa entre semana, la fuente oficial reporta una restricción adicional los sábados
        con dígitos que rotan cada semana — consulta siempre la fuente oficial antes de un sábado específico.
        Detalle completo en{" "}
        <Link href={{ pathname: "/ciudades/[slug]", params: { slug: "bucaramanga" } }} className="font-semibold text-foreground underline">
          la página de Bucaramanga
        </Link>
        .
      </P>

      <H3>Cartagena</H3>
      <P>
        Tiene <strong>dos franjas horarias por día</strong> (mañana y tarde) en vez de una sola jornada continua.
        Exceptúa eléctricos, híbridos y vehículos de personas con discapacidad. Consulta las franjas exactas en{" "}
        <Link href={{ pathname: "/ciudades/[slug]", params: { slug: "cartagena" } }} className="font-semibold text-foreground underline">
          la página de Cartagena
        </Link>
        .
      </P>

      <H3>Barranquilla</H3>
      <P>
        Es la excepción de la lista: <strong>no tiene pico y placa vigente para vehículos particulares</strong> —
        fue derogado por decreto distrital. Sigue vigente para otras categorías en algunos corredores. Revisa el
        estado actual en{" "}
        <Link href={{ pathname: "/ciudades/[slug]", params: { slug: "barranquilla" } }} className="font-semibold text-foreground underline">
          la página de Barranquilla
        </Link>
        .
      </P>

      <H2>Tabla comparativa rápida</H2>
      <TableWrap>
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-xs font-semibold uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Ciudad</th>
              <th className="px-4 py-3">Vigencia</th>
              <th className="px-4 py-3">Excepciones propias</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr><td className="px-4 py-3 font-semibold">Bogotá</td><td className="px-4 py-3 text-muted-foreground">Activa</td><td className="px-4 py-3 text-muted-foreground">Motocicletas</td></tr>
            <tr><td className="px-4 py-3 font-semibold">Medellín</td><td className="px-4 py-3 text-muted-foreground">Activa</td><td className="px-4 py-3 text-muted-foreground">Gas natural vehicular</td></tr>
            <tr><td className="px-4 py-3 font-semibold">Cali</td><td className="px-4 py-3 text-muted-foreground">Activa</td><td className="px-4 py-3 text-muted-foreground">Motocicletas, discapacidad</td></tr>
            <tr><td className="px-4 py-3 font-semibold">Bucaramanga</td><td className="px-4 py-3 text-muted-foreground">Activa</td><td className="px-4 py-3 text-muted-foreground">Gas natural vehicular</td></tr>
            <tr><td className="px-4 py-3 font-semibold">Cartagena</td><td className="px-4 py-3 text-muted-foreground">Activa (2 franjas/día)</td><td className="px-4 py-3 text-muted-foreground">Discapacidad</td></tr>
            <tr><td className="px-4 py-3 font-semibold">Barranquilla</td><td className="px-4 py-3 text-muted-foreground">No vigente (particulares)</td><td className="px-4 py-3 text-muted-foreground">—</td></tr>
          </tbody>
        </table>
      </TableWrap>

      <Callout>
        Las rotaciones y fechas de vigencia cambian por decreto varias veces al año — esta guía resume los
        patrones generales. Para el dígito exacto de hoy y la fuente oficial de cada norma, entra a la página
        de cada ciudad o consulta{" "}
        <Link href={{ pathname: "/ciudades/pais/[country]", params: { country: "colombia" } }} className="font-semibold underline">
          el resumen de todas las ciudades de Colombia
        </Link>
        .
      </Callout>

      <H2>¿Necesitas esta información en tu app o sistema?</H2>
      <P>
        Toda la información de esta guía viene de la misma API que usamos para construir estas páginas.
        Si estás construyendo una app, un sistema de flotas o cualquier producto que necesite consultar el pico
        y placa vigente por placa o por ciudad, revisa{" "}
        <Link href="/precios" className="font-semibold text-foreground underline">
          los planes de la API
        </Link>
        .
      </P>
    </>
  );
}
