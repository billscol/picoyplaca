import { Link } from "@/navigation";
import { H2, P, Ul, Li, Callout } from "@/components/marketing/blog-prose";

export default function Body() {
  return (
    <>
      <P>
        Circular con tu carro particular en un horario y dígito restringidos por el pico y placa tiene una
        consecuencia económica y una operativa. Esto es lo que dicen las fuentes oficiales de Bogotá,
        Medellín, Cali, Bucaramanga y Cartagena — y es, en las cinco, exactamente la misma norma.
      </P>

      <H2>¿Cuánto es la multa?</H2>
      <P>
        La multa es de <strong>15 SMLDV</strong> (salarios mínimos legales diarios vigentes) en las cinco
        ciudades colombianas con pico y placa activo que revisamos. El valor en pesos depende del salario
        mínimo del año vigente — como cambia cada 1 de enero, no lo fijamos aquí para no quedar desactualizados;
        consulta el SMLDV del año en curso y multiplícalo por 15, o revisa la fuente oficial de tu ciudad para
        el valor ya calculado.
      </P>

      <H2>¿Cuál es el fundamento legal?</H2>
      <P>
        Las cinco ciudades citan la misma base nacional:{" "}
        <strong>Art. 131-C.14 de la Ley 769 de 2002 (Código Nacional de Tránsito), modificado por el art. 21
        de la Ley 1383 de 2010</strong>. Es una norma nacional, no municipal — lo que varía entre ciudades es
        el horario y el dígito restringido, no el monto de la multa ni el artículo que la respalda.
      </P>

      <H2>¿Qué pasa además de la multa?</H2>
      <P>
        Las cinco fuentes oficiales reportan la misma consecuencia adicional:{" "}
        <strong>inmovilización del vehículo</strong>. Esto significa que, además del valor económico de la
        multa, el carro puede quedar retenido — con los costos de grúa y parqueadero que eso implica, que son
        aparte de la multa misma.
      </P>

      <Callout>
        Esta información resume lo que reportan las fuentes oficiales de cada ciudad al momento de escribir
        esta guía. Las normas de tránsito cambian; antes de decisiones importantes, verifica el monto exacto y
        vigente directamente en la fuente oficial enlazada desde la página de tu ciudad.
      </Callout>

      <H2>¿Cómo evito la multa?</H2>
      <Ul>
        <Li>Verifica el dígito y horario restringido de tu ciudad <strong>antes de salir</strong>, no cuando ya estás en la vía.</Li>
        <Li>Si tu vehículo es eléctrico, híbrido, o cae en alguna de las categorías exceptuadas de tu ciudad, confírmalo — puede que no necesites preocuparte.</Li>
        <Li>Recuerda que la restricción normalmente <strong>se suspende en festivos</strong> en la mayoría de estas ciudades, pero confírmalo para tu ciudad específica antes de un festivo puntual.</Li>
        <Li>Si tienes dudas sobre tu categoría de vehículo (moto, taxi, transporte especial), esas suelen tener reglas distintas a las de particulares — no asumas que las mismas reglas aplican.</Li>
      </Ul>

      <P>
        Consulta el pico y placa vigente hoy, por placa, en cualquiera de estas ciudades:{" "}
        <Link href={{ pathname: "/ciudades/[slug]", params: { slug: "bogota" } }} className="font-semibold text-foreground underline">Bogotá</Link>,{" "}
        <Link href={{ pathname: "/ciudades/[slug]", params: { slug: "medellin" } }} className="font-semibold text-foreground underline">Medellín</Link>,{" "}
        <Link href={{ pathname: "/ciudades/[slug]", params: { slug: "cali" } }} className="font-semibold text-foreground underline">Cali</Link>,{" "}
        <Link href={{ pathname: "/ciudades/[slug]", params: { slug: "bucaramanga" } }} className="font-semibold text-foreground underline">Bucaramanga</Link>{" "}
        o{" "}
        <Link href={{ pathname: "/ciudades/[slug]", params: { slug: "cartagena" } }} className="font-semibold text-foreground underline">Cartagena</Link>
        . O revisa{" "}
        <Link href={{ pathname: "/ciudades/pais/[country]", params: { country: "colombia" } }} className="font-semibold text-foreground underline">
          todas las ciudades de Colombia
        </Link>{" "}
        en un solo lugar.
      </P>
    </>
  );
}
