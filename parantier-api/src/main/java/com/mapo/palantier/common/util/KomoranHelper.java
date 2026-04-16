package com.mapo.palantier.common.util;

import kr.co.shineware.nlp.komoran.constant.DEFAULT_MODEL;
import kr.co.shineware.nlp.komoran.core.Komoran;
import kr.co.shineware.nlp.komoran.model.Token;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class KomoranHelper {

    private static final Komoran KOMORAN = new Komoran(DEFAULT_MODEL.FULL);

    private static final Set<String> NOUN_POS = Set.of(
        "NNG",  // 일반 명사
        "NNP",  // 고유 명사
        "SL",   // 외국어 (영문)
        "SH",   // 한자
        "SN"    // 숫자
    );

    private KomoranHelper() {
    }

    public static List<String> extractNouns(String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }

        List<Token> tokens = KOMORAN.analyze(text).getTokenList();
        List<String> nouns = new ArrayList<>();

        for (Token token : tokens) {
            if (NOUN_POS.contains(token.getPos()) && token.getMorph().length() >= 2) {
                nouns.add(token.getMorph().toLowerCase());
            }
        }

        return nouns;
    }
}
