<?php

declare(strict_types=1);

namespace PicoPlaca\Core;

/**
 * Validador de inputs de la API. Soporta:
 *   required, nullable, string, int, float, numeric, bool, array, json,
 *   email, url, uuid, ip, regex:pattern, min:N, max:N, between:A,B,
 *   in:val1,val2, date, date_format:Y-m-d, confirmed, same:campo, different:campo,
 *   alpha, alpha_num, alpha_dash
 *
 * Uso:
 *   $errors = Validator::validate($data, ['email' => 'required|email|max:255']);
 *   if ($errors) Response::unprocessable($errors);
 */
final class Validator
{
    public static function validate(array $data, array $rules): array
    {
        $errors = [];

        foreach ($rules as $field => $ruleString) {
            $fieldRules = is_array($ruleString) ? $ruleString : explode('|', $ruleString);
            $value      = self::dataGet($data, $field);
            $hasField   = self::dataHas($data, $field);

            $isRequired = in_array('required', $fieldRules, true);
            $isNullable = in_array('nullable', $fieldRules, true);
            $isNumericField = (bool) array_intersect(['numeric', 'int', 'integer', 'float'], $fieldRules);

            if ($isRequired && (!$hasField || $value === null || $value === '')) {
                $errors[$field] = self::msg($field, 'required');
                continue;
            }

            if (!$isRequired && (!$hasField || $value === null || $value === '')) {
                if ($isNullable || !$hasField) {
                    continue;
                }
            }

            foreach ($fieldRules as $rule) {
                if (in_array($rule, ['required', 'nullable', 'present'], true)) {
                    continue;
                }

                [$name, $arg] = self::parseRule($rule);
                $err = self::applyRule($name, $arg, $value, $field, $data, $isNumericField);

                if ($err !== null) {
                    $errors[$field] = $err;
                    break;
                }
            }
        }

        return $errors;
    }

    private static function parseRule(string $rule): array
    {
        if (str_contains($rule, ':')) {
            [$name, $arg] = explode(':', $rule, 2);
            return [trim($name), $arg];
        }
        return [trim($rule), null];
    }

    private static function dataGet(array $data, string $field): mixed
    {
        if (!str_contains($field, '.')) {
            return $data[$field] ?? null;
        }
        $keys = explode('.', $field);
        $cur  = $data;
        foreach ($keys as $k) {
            if (!is_array($cur) || !array_key_exists($k, $cur)) {
                return null;
            }
            $cur = $cur[$k];
        }
        return $cur;
    }

    private static function dataHas(array $data, string $field): bool
    {
        if (!str_contains($field, '.')) {
            return array_key_exists($field, $data);
        }
        $keys = explode('.', $field);
        $cur  = $data;
        foreach ($keys as $k) {
            if (!is_array($cur) || !array_key_exists($k, $cur)) {
                return false;
            }
            $cur = $cur[$k];
        }
        return true;
    }

    private static function applyRule(string $name, ?string $arg, mixed $value, string $field, array $data, bool $isNumericField = false): ?string
    {
        switch ($name) {
            case 'string':
                return is_string($value) ? null : self::msg($field, 'string');
            case 'int':
            case 'integer':
                return filter_var($value, FILTER_VALIDATE_INT) !== false ? null : self::msg($field, 'int');
            case 'float':
            case 'numeric':
                return is_numeric($value) ? null : self::msg($field, 'numeric');
            case 'bool':
            case 'boolean':
                $b = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                return $b !== null ? null : self::msg($field, 'bool');
            case 'array':
                return is_array($value) ? null : self::msg($field, 'array');
            case 'json':
                if (!is_string($value)) return self::msg($field, 'json');
                json_decode($value);
                return json_last_error() === JSON_ERROR_NONE ? null : self::msg($field, 'json');
            case 'email':
                return filter_var($value, FILTER_VALIDATE_EMAIL) ? null : self::msg($field, 'email');
            case 'url':
                return filter_var($value, FILTER_VALIDATE_URL) ? null : self::msg($field, 'url');
            case 'uuid':
                return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', (string)$value) ? null : self::msg($field, 'uuid');
            case 'ip':
                return filter_var($value, FILTER_VALIDATE_IP) ? null : self::msg($field, 'ip');
            case 'regex':
                if ($arg === null) return null;
                return preg_match($arg, (string)$value) ? null : self::msg($field, 'regex');
            case 'min':
                if ($arg === null || !is_numeric($arg)) return null;
                return self::sizeOf($value, $isNumericField) >= ($arg + 0) ? null : self::msg($field, 'min', $arg);
            case 'max':
                if ($arg === null || !is_numeric($arg)) return null;
                return self::sizeOf($value, $isNumericField) <= ($arg + 0) ? null : self::msg($field, 'max', $arg);
            case 'between':
                if ($arg === null) return null;
                [$a, $b] = array_map('floatval', explode(',', $arg, 2) + [1 => '0']);
                if (!is_numeric($value)) return self::msg($field, 'numeric');
                return ($value >= $a && $value <= $b) ? null : self::msg($field, 'between', "$a y $b");
            case 'in':
                if ($arg === null) return null;
                $allowed = array_map('trim', explode(',', $arg));
                return in_array((string)$value, $allowed, true) ? null : self::msg($field, 'in', implode(', ', $allowed));
            case 'date':
                return strtotime((string)$value) !== false ? null : self::msg($field, 'date');
            case 'date_format':
                if ($arg === null) return null;
                $d = \DateTime::createFromFormat($arg, (string)$value);
                return ($d && $d->format($arg) === $value) ? null : self::msg($field, 'date_format', $arg);
            case 'confirmed':
                $other = $data[$field . '_confirmation'] ?? null;
                return $other === $value ? null : self::msg($field, 'confirmed');
            case 'same':
                if ($arg === null) return null;
                return self::dataGet($data, $arg) === $value ? null : self::msg($field, 'same', $arg);
            case 'different':
                if ($arg === null) return null;
                return self::dataGet($data, $arg) !== $value ? null : self::msg($field, 'different', $arg);
            case 'alpha':
                return preg_match('/^[\p{L}]+$/u', (string)$value) ? null : self::msg($field, 'alpha');
            case 'alpha_num':
                return preg_match('/^[\p{L}\p{N}]+$/u', (string)$value) ? null : self::msg($field, 'alpha_num');
            case 'alpha_dash':
                return preg_match('/^[\p{L}\p{N}_-]+$/u', (string)$value) ? null : self::msg($field, 'alpha_dash');
            default:
                return null;
        }
    }

    private static function sizeOf(mixed $value, bool $numericField): int|float
    {
        if ($numericField && is_numeric($value)) {
            return $value + 0;
        }
        if (is_int($value) || is_float($value)) {
            return $value;
        }
        if (is_string($value)) {
            return strlen($value);
        }
        if (is_array($value)) {
            return count($value);
        }
        if (is_numeric($value)) {
            return $value + 0;
        }
        return 0;
    }

    private static function msg(string $field, string $rule, mixed $arg = null): string
    {
        return match ($rule) {
            'required'    => "El campo {$field} es requerido",
            'string'      => "El campo {$field} debe ser texto",
            'int'         => "El campo {$field} debe ser un entero",
            'numeric'     => "El campo {$field} debe ser numerico",
            'bool'        => "El campo {$field} debe ser booleano",
            'array'       => "El campo {$field} debe ser un arreglo",
            'json'        => "El campo {$field} debe ser JSON valido",
            'email'       => "El campo {$field} debe ser un email valido",
            'url'         => "El campo {$field} debe ser una URL valida",
            'uuid'        => "El campo {$field} debe ser un UUID valido",
            'ip'          => "El campo {$field} debe ser una IP valida",
            'regex'       => "El campo {$field} tiene un formato invalido",
            'min'         => "El campo {$field} debe tener al menos {$arg}",
            'max'         => "El campo {$field} no puede superar {$arg}",
            'between'     => "El campo {$field} debe estar entre {$arg}",
            'in'          => "El campo {$field} debe ser uno de: {$arg}",
            'date'        => "El campo {$field} debe ser una fecha valida",
            'date_format' => "El campo {$field} debe tener formato {$arg}",
            'confirmed'   => "La confirmacion del campo {$field} no coincide",
            'same'        => "El campo {$field} debe coincidir con {$arg}",
            'different'   => "El campo {$field} debe ser diferente de {$arg}",
            'alpha'       => "El campo {$field} debe contener solo letras",
            'alpha_num'   => "El campo {$field} debe contener solo letras y numeros",
            'alpha_dash'  => "El campo {$field} debe contener solo letras, numeros, guiones y guiones bajos",
            default       => "El campo {$field} es invalido",
        };
    }
}
