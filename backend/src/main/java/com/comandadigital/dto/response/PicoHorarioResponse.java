package com.comandadigital.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PicoHorarioResponse {
    private int hora;
    private long quantidade;
}
