SELECT
    `mebyme`.`hoegaathet`.`id` AS `id`,
    `mebyme`.`hoegaathet`.`username` AS `username`,
    `aspect_settings_per_user_view`.`aspect_type` AS `aspect_type`,
    `mebyme`.`hoegaathet`.`datum` AS `datum`,
    `mebyme`.`hoegaathet`.`aspect` AS `aspect`,
    `aspect_settings_per_user_view`.`icon` AS `icon`,
    `mebyme`.`hoegaathet`.`waardeDagdelen` AS `waardeDagdelen`,
    `mebyme`.`hoegaathet`.`last_calc_waarde` AS `last_calc_waarde`,
    `aspect_settings_per_user_view`.`dagdelenInvullen` AS `dagdelenInvullen`,
    `aspect_settings_per_user_view`.`aantalDagDelenBijAutoInvullen` AS `aantalDagdelenBijAutoInvullen`,
    `mebyme`.`hoegaathet`.`opmerking` AS `opmerking`,
    `aspect_settings_per_user_view`.`sliderRij` AS `sliderRij`,
    `aspect_settings_per_user_view`.`dagwaardeBerekening` AS `dagwaardeBerekening`,
    `aspect_settings_per_user_view`.`bijInvoerTonen` AS `bijInvoerTonen`,
    `aspect_settings_per_user_view`.`toon_max` AS `toon_max`,
	`aspect_settings_per_user_view`.dagwaardeBerekening_type` AS `dagwaardeBerekening_type`,
    `aspect_settings_per_user_view`.dagwaardeBerekening_maxExtra` AS `dagwaardeBerekening_maxExtra`
FROM
    (
        `mebyme`.`hoegaathet`
    JOIN `mebyme`.`aspect_settings_per_user_view` ON
        (
            `mebyme`.`hoegaathet`.`username` = `aspect_settings_per_user_view`.`username` AND `mebyme`.`hoegaathet`.`aspect` = `aspect_settings_per_user_view`.`aspect`
        )
    )
WHERE
    `mebyme`.`hoegaathet`.`deleted` = 0
ORDER BY
    `mebyme`.`hoegaathet`.`datum`
DESC
    