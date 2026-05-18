<?php

namespace App\Http\Requests\Glpi;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'entity_id'    => ['required', 'integer'],
            'requester_id' => ['required', 'integer'],
            'type'         => ['required', 'integer', 'in:1,2'],
            'category_id'  => ['nullable', 'integer'],
            'title'        => ['required', 'string', 'max:255'],
            'description'  => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'entity_id.required'    => 'La entidad es obligatoria.',
            'entity_id.integer'     => 'La entidad debe ser un número entero.',
            'requester_id.required' => 'El solicitante es obligatorio.',
            'requester_id.integer'  => 'El solicitante debe ser un número entero.',
            'type.required'         => 'El tipo de caso es obligatorio.',
            'type.in'               => 'El tipo debe ser 1 (Incidencia) o 2 (Solicitud).',
            'category_id.integer'   => 'La categoría debe ser un número entero.',
            'title.required'        => 'El título es obligatorio.',
            'title.max'             => 'El título no puede superar los 255 caracteres.',
            'description.required'  => 'La descripción es obligatoria.',
        ];
    }
}
