# Emails da Adsgator — base para refinar

> Cole aqui os emails que você usa hoje (assunto + corpo). Vamos usá-los como
> base e refinar/aprimorar (mesmo processo do onboarding: você dá a base, a gente
> lapida no padrão de voz — ver docs/ONBOARDING_CLIENTE_SPEC.md e a memory
> padrao-voz-mensagens). Não precisa formatar bonito; cole como tiver.

Para cada email, se puder, me diga:

- **Quando dispara** (ex.: ao gerar relatório, cobrança vencida, boas-vindas)
- **Para quem** (cliente ou você/operador)
- **Assunto**
- **Corpo**
- **Variáveis** que mudam por cliente (nome, mês, valor, link…)

---

## Templates de email que JÁ existem no sistema

Estão em `lib/email.ts` (base) e podem ter override editável em
`email_templates` (Configurações → Templates de Email). Marque quais você quer
**manter, trocar pelo seu, ou remover** — e adicione os que faltam.

| ID                        | Quando / para quem                      |
| ------------------------- | --------------------------------------- |
| `report-google-ads`       | Relatório Google Ads pronto → cliente   |
| `report-ga4`              | Relatório GA4 pronto → cliente          |
| `report-executive`        | Relatório executivo → cliente           |
| `welcome`                 | Boas-vindas → cliente                   |
| `payment-reminder`        | Lembrete de pagamento (régua) → cliente |
| `payment-followup`        | Follow-up de cobrança → cliente         |
| `alert-saldo-baixo`       | Saldo Google Ads baixo → cliente        |
| `alert-performance`       | Alerta de performance → cliente         |
| `cancelamento-notice`     | Aviso de cancelamento → cliente         |
| `aviso-indisponibilidade` | Aviso de indisponibilidade → cliente    |
| `encerramento`            | Encerramento → cliente                  |
| `reativacao`              | Reativação → cliente                    |

---

## MEUS EMAILS (cole abaixo)

<!-- Cole aqui. Pode ser um por bloco, na ordem que preferir. -->

##Bem-vindo à Adsgator!

<table width="100%" cellspacing="0" cellpadding="0" style="background-color: rgb(249, 249, 249); font-family: Arial, sans-serif; width: 100%;" bgcolor="rgb(249, 249, 249)">
	<tbody valign="middle">
		<tr valign="inherit">
			<td align="center" valign="inherit">

    			<table width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; width:100%; border-radius: 12px; overflow: hidden; box-shadow: rgba(0, 0, 0, 0.05) 0px 2px 8px; background-color: rgb(255, 255, 255); margin: 60px 0 60px 0;" bgcolor="rgb(255, 255, 255)">
    				<tbody valign="middle">
    					<tr valign="inherit">
    						<td style="padding: 0; background-color: #ffffff;" bgcolor="rgb(255, 255, 255)" align="center" valign="inherit"><img src="https://adsgator.com.br/wp-content/uploads/2025/11/banner-topo-email-comunicacao-v1.png" alt="Adsgator" width="600" height="130" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0px;" data-clarity-loaded="qvopa8"></td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #FFB100; padding: 30px 20px; color: #111111;" bgcolor="rgb(255, 177, 0)" align="left" valign="inherit">

    							<h1 style="margin: 0; font-size: 22px;"><span style="color: rgb(35, 31, 32);">Bem-vindo &agrave; Adsgator!</span></h1>
    						</td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #F1F1F1; padding: 0 20px 30px 20px; color: #333333;" bgcolor="rgb(241, 241, 241)" align="left" valign="inherit">

    							<p style="font-size: 16px; margin-bottom: 15px;"><span style="font-size: 12pt;">Ol&aacute;, <strong data-path-to-node="7" data-index-in-node="6">[Nome]</strong>, tudo bem?</span></p>

    							<p data-path-to-node="8"><span style="font-size: 12pt;">Seja muito bem-vindo &agrave; Adsgator! Ficamos felizes em saber que agora somos parceiros no crescimento do seu neg&oacute;cio.</span></p>

    							<p data-path-to-node="9"><span style="font-size: 12pt;">Recebemos a confirma&ccedil;&atilde;o da sua assinatura e j&aacute; estamos com tudo pronto para come&ccedil;ar. Para garantir que nossa parceria seja a mais clara e eficiente poss&iacute;vel, estou enviando abaixo o link dos nossos <strong data-path-to-node="9" data-index-in-node="198">Termos de Servi&ccedil;o</strong>, que voc&ecirc; aceitou no momento da contrata&ccedil;&atilde;o:</span></p>

    							<p data-path-to-node="10"><span style="font-size: 12pt;">🔗 <strong data-path-to-node="10" data-index-in-node="3">Acesse aqui:</strong> <a target="_blank" rel="noopener noreferrer" href="https://adsgator.com.br/termos-de-servico/" id="isPasted" style="font-size: 12pt;">https://adsgator.com.br/termos-de-servico/</a></span></p>

    							<p data-path-to-node="11"><span style="font-size: 12pt;">Neste link, voc&ecirc; encontra todos os detalhes sobre nossos prazos de entrega, regras de suporte e pol&iacute;ticas de cancelamento/reativa&ccedil;&atilde;o.</span></p>

    							<p data-path-to-node="12"><span style="font-size: 12pt;"><strong data-path-to-node="12" data-index-in-node="0">O que acontece agora?</strong></span></p>

    							<p data-path-to-node="12"><span style="font-size: 12pt;">Nossa equipe entrar&aacute; em contato com voc&ecirc; via WhatsApp em breve para coletarmos as informa&ccedil;&otilde;es necess&aacute;rias e iniciarmos o desenvolvimento.</span></p>

    							<p data-path-to-node="13"><span style="font-size: 12pt;">Se tiver qualquer d&uacute;vida inicial, &eacute; s&oacute; responder a este e-mail ou chamar no WhatsApp.&nbsp;Um abra&ccedil;o!</span></p>
    						</td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #ffffff; padding: 20px; font-size: 12px; color: #888888;" bgcolor="rgb(255, 255, 255)" align="left" valign="inherit">

    							<p style="margin: 0;"><a href="https://adsgator.com.br/termos" style="color: #888888;">Termos de Servi&ccedil;o</a> | <a href="https://adsgator.com.br/privacidade" style="color: #888888;">Pol&iacute;tica de Privacidade</a> | <a href="https://adsgator.com.br/ajuda" style="color: #888888;">Central de Ajuda</a></p>

    							<p style="margin-top: 10px;">Este e-mail &eacute; somente para notifica&ccedil;&atilde;o. Para entrar em contato, envie um e-mail para <a href="mailto:contato@adsgator.com.br" style="color: #888888;">contato@adsgator.com.br</a>.</p>
    						</td>
    					</tr>
    				</tbody>
    			</table>
    		</td>
    	</tr>
    </tbody>

</table>

---

##Suspensão Temporária

<table width="100%" cellspacing="0" cellpadding="0" style="background-color: rgb(249, 249, 249); font-family: Arial, sans-serif; width: 100%;" bgcolor="rgb(249, 249, 249)">
	<tbody valign="middle">
		<tr valign="inherit">
			<td align="center" valign="inherit">

    			<table width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; width:100%; border-radius: 12px; overflow: hidden; box-shadow: rgba(0, 0, 0, 0.05) 0px 2px 8px; background-color: rgb(255, 255, 255); margin: 60px 0 60px 0;" bgcolor="rgb(255, 255, 255)">
    				<tbody valign="middle">
    					<tr valign="inherit">
    						<td style="padding: 0; background-color: #ffffff;" bgcolor="rgb(255, 255, 255)" align="center" valign="inherit"><img src="https://adsgator.com.br/wp-content/uploads/2025/11/banner-topo-email-comunicacao-v1.png" alt="Adsgator" width="600" height="130" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0px;" data-clarity-loaded="qvopa8"></td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #FFB100; padding: 30px 20px; color: #111111;" bgcolor="rgb(255, 177, 0)" align="left" valign="inherit">

    							<h1 style="margin: 0; font-size: 22px;"><span style="color: rgb(35, 31, 32);">AVISO IMPORTANTE: Suspens&atilde;o Tempor&aacute;ria de Servi&ccedil;os</span></h1>
    						</td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #F1F1F1; padding: 0 20px 30px 20px; color: #333333;" bgcolor="rgb(241, 241, 241)" align="left" valign="inherit">

    							<p style="font-size: 16px; margin-bottom: 15px;"><span style="font-size: 12pt;">Informamos que, devido &agrave; aus&ecirc;ncia de pagamento da mensalidade com vencimento em <strong>00/00/2026</strong>, seu plano na Adsgator foi <strong data-path-to-node="5" data-index-in-node="151">temporariamente pausado</strong> a partir de hoje.</span></p>

    							<p data-path-to-node="6"><span style="font-size: 12pt;">Conforme nossos&nbsp;</span><span style="font-size: 12pt;"><a href="https://adsgator.com.br/termos-de-servico/" target="_blank" rel="noopener noreferrer">Termos de Servi&ccedil;o</a></span><span style="font-size: 12pt;">, o atraso superior a 7 dias resulta na suspens&atilde;o imediata dos seguintes servi&ccedil;os:</span></p>

    							<ul data-path-to-node="7">
    								<li style="font-size: 12pt;">

    									<p data-path-to-node="7,0,0"><strong data-path-to-node="7,0,0" data-index-in-node="0">Website / Landing Page:</strong> Ficar&atilde;o fora do ar (indispon&iacute;veis para acesso).</p>
    								</li>
    								<li style="font-size: 12pt;">

    									<p data-path-to-node="7,1,0"><strong data-path-to-node="7,1,0" data-index-in-node="0">Google Ads:</strong> As campanhas foram interrompidas para evitar gastos sem destino.</p>
    								</li>
    								<li style="font-size: 12pt;">

    									<p data-path-to-node="7,2,0"><strong data-path-to-node="7,2,0" data-index-in-node="0">E-mail Profissional:</strong> O acesso poder&aacute; apresentar instabilidade.</p>
    								</li>
    							</ul>

    							<p data-path-to-node="8"><span style="font-size: 12pt;"><strong data-path-to-node="8" data-index-in-node="0">Como regularizar e reativar seus servi&ccedil;os?&nbsp;</strong>Para que tudo volte ao normal o quanto antes, basta realizar o pagamento atrav&eacute;s do link abaixo:</span></p>

    							<p data-path-to-node="9"><span style="font-size: 12pt;">💳 <strong data-path-to-node="9" data-index-in-node="3">Link para pagamento:</strong> [Link do Asaas aqui]</span></p>

    							<p data-path-to-node="10"><span style="font-size: 12pt;">Assim que o pagamento for identificado, nossa equipe far&aacute; a reativa&ccedil;&atilde;o t&eacute;cnica em at&eacute; <strong data-path-to-node="10" data-index-in-node="86">24 horas &uacute;teis</strong>.</span></p>

    							<p data-path-to-node="11"><span style="font-size: 12pt;"><strong data-path-to-node="11" data-index-in-node="0">Aten&ccedil;&atilde;o:</strong> Caso o atraso complete 15 dias, o plano ser&aacute; cancelado por inadimpl&ecirc;ncia e a estrutura ser&aacute; removida de nossos servidores. Evite a perda de dados e a interrup&ccedil;&atilde;o de suas vendas regularizando sua conta hoje mesmo.</span></p>

    							<p data-path-to-node="12"><span style="font-size: 12pt;">Qualquer d&uacute;vida, estamos &agrave; disposi&ccedil;&atilde;o.</span></p>
    						</td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #ffffff; padding: 20px; font-size: 12px; color: #888888;" bgcolor="rgb(255, 255, 255)" align="left" valign="inherit">

    							<p style="margin: 0;"><a href="https://adsgator.com.br/termos" style="color: #888888;">Termos de Servi&ccedil;o</a> | <a href="https://adsgator.com.br/privacidade" style="color: #888888;">Pol&iacute;tica de Privacidade</a> | <a href="https://adsgator.com.br/ajuda" style="color: #888888;">Central de Ajuda</a></p>

    							<p style="margin-top: 10px;">Este e-mail &eacute; somente para notifica&ccedil;&atilde;o. Para entrar em contato, envie um e-mail para <a href="mailto:contato@adsgator.com.br" style="color: #888888;">contato@adsgator.com.br</a>.</p>
    						</td>
    					</tr>
    				</tbody>
    			</table>
    		</td>
    	</tr>
    </tbody>

</table>

---

##Plano Reativado!

<table width="100%" cellspacing="0" cellpadding="0" style="background-color: rgb(249, 249, 249); font-family: Arial, sans-serif; width: 100%;" bgcolor="rgb(249, 249, 249)">
	<tbody valign="middle">
		<tr valign="inherit">
			<td align="center" valign="inherit">

    			<table width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; width:100%; border-radius: 12px; overflow: hidden; box-shadow: rgba(0, 0, 0, 0.05) 0px 2px 8px; background-color: rgb(255, 255, 255); margin: 60px 0 60px 0;" bgcolor="rgb(255, 255, 255)">
    				<tbody valign="middle">
    					<tr valign="inherit">
    						<td style="padding: 0; background-color: #ffffff;" bgcolor="rgb(255, 255, 255)" align="center" valign="inherit"><img src="https://adsgator.com.br/wp-content/uploads/2025/11/banner-topo-email-comunicacao-v1.png" alt="Adsgator" width="600" height="130" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0px;" data-clarity-loaded="qvopa8"></td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #FFB100; padding: 30px 20px; color: #111111;" bgcolor="rgb(255, 177, 0)" align="left" valign="inherit">

    							<h1 style="margin: 0; font-size: 22px;"><span style="color: rgb(35, 31, 32);">​</span><span style="color: rgb(35, 31, 32); user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">Plano Reativado!</span></h1>
    						</td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #F1F1F1; padding: 0 20px 30px 20px; color: #333333;" bgcolor="rgb(241, 241, 241)" align="left" valign="inherit">

    							<p style="font-size: 16px; margin-bottom: 15px;"><span style="font-size: 12pt; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">Recebemos a confirma&ccedil;&atilde;o do seu pagamento. Muito obrigado por regularizar sua conta!</span></p>

    							<p data-path-to-node="7" style="color: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 14.5px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: -webkit-left; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><span style="font-size: 12pt; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">Informamos que o seu plano j&aacute; foi <strong data-path-to-node="7" data-index-in-node="46" style="font-weight: 700; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">reativado</strong> em nosso sistema. Agora, nossa equipe t&eacute;cnica est&aacute; trabalhando para colocar o seu site e demais servi&ccedil;os de volta ao ar.</span></p>

    							<p data-path-to-node="8" style="color: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 14.5px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: -webkit-left; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><span style="font-size: 12pt; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><strong data-path-to-node="8" data-index-in-node="0" style="font-weight: 700; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">Informa&ccedil;&otilde;es importantes sobre a reativa&ccedil;&atilde;o:</strong></span></p>

    							<ul data-path-to-node="9" style="color: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 14.5px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: -webkit-left; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; user-select: inherit; scrollbar-color: auto; margin-bottom: 10.5px; margin-top: 0px; box-sizing: border-box; list-style-position: outside;">
    								<li style="font-size: 12pt; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">

    									<p data-path-to-node="9,0,0" style="user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><strong data-path-to-node="9,0,0" data-index-in-node="0" style="font-weight: 700; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">Prazo:</strong> O restabelecimento completo dos servi&ccedil;os ocorre em at&eacute;&nbsp;<strong data-path-to-node="9,0,0" data-index-in-node="62" style="font-weight: 700; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">24 horas &uacute;teis</strong>.</p>
    								</li>
    								<li style="font-size: 12pt; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">

    									<p data-path-to-node="9,1,0" style="user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><strong data-path-to-node="9,1,0" data-index-in-node="0" style="font-weight: 700; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">An&uacute;ncios (Google Ads):</strong> Caso voc&ecirc; tenha gest&atilde;o de tr&aacute;fego conosco, as campanhas ser&atilde;o retomadas assim que o site estiver totalmente online.</p>
    								</li>
    								<li style="font-size: 12pt; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">

    									<p data-path-to-node="9,2,0" style="user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><strong data-path-to-node="9,2,0" data-index-in-node="0" style="font-weight: 700; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">E-mail Profissional:</strong> Se houve alguma instabilidade no acesso, ela ser&aacute; normalizada junto com a hospedagem.</p>
    								</li>
    							</ul>

    							<p data-path-to-node="10" style="color: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 14.5px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: -webkit-left; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><span style="font-size: 12pt; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">Ficamos felizes em continuar essa parceria com voc&ecirc;! Se tiver qualquer d&uacute;vida ou precisar de algo, estamos a disposi&ccedil;&atilde;o.</span></p>
    						</td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #ffffff; padding: 20px; font-size: 12px; color: #888888;" bgcolor="rgb(255, 255, 255)" align="left" valign="inherit">

    							<p style="margin: 0;"><a href="https://adsgator.com.br/termos" style="color: #888888;">Termos de Servi&ccedil;o</a> | <a href="https://adsgator.com.br/privacidade" style="color: #888888;">Pol&iacute;tica de Privacidade</a> | <a href="https://adsgator.com.br/ajuda" style="color: #888888;">Central de Ajuda</a></p>

    							<p style="margin-top: 10px;">Este e-mail &eacute; somente para notifica&ccedil;&atilde;o. Para entrar em contato, envie um e-mail para <a href="mailto:contato@adsgator.com.br" style="color: #888888;">contato@adsgator.com.br</a>.</p>
    						</td>
    					</tr>
    				</tbody>
    			</table>
    		</td>
    	</tr>
    </tbody>

</table>

---

##Cancelamento do plano por atraso

<table width="100%" cellspacing="0" cellpadding="0" style="background-color: rgb(249, 249, 249); font-family: Arial, sans-serif; width: 100%;" bgcolor="rgb(249, 249, 249)">
	<tbody valign="middle">
		<tr valign="inherit">
			<td align="center" valign="inherit">

    			<table width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; width:100%; border-radius: 12px; overflow: hidden; box-shadow: rgba(0, 0, 0, 0.05) 0px 2px 8px; background-color: rgb(255, 255, 255); margin: 60px 0 60px 0;" bgcolor="rgb(255, 255, 255)">
    				<tbody valign="middle">
    					<tr valign="inherit">
    						<td style="padding: 0; background-color: #ffffff;" bgcolor="rgb(255, 255, 255)" align="center" valign="inherit"><img src="https://adsgator.com.br/wp-content/uploads/2025/11/banner-topo-email-comunicacao-v1.png" alt="Adsgator" width="600" height="130" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0px;" data-clarity-loaded="qvopa8"></td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #FFB100; padding: 30px 20px; color: #111111;" bgcolor="rgb(255, 177, 0)" align="left" valign="inherit">

    							<h1 style="margin: 0; font-size: 22px;"><span style="color: rgb(35, 31, 32);">​</span><span style="color: rgb(35, 31, 32); user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><strong style="font-weight: 700; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">Cancelamento do plano por atraso</strong></span></h1>
    						</td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #F1F1F1; padding: 0 20px 30px 20px; color: #333333;" bgcolor="rgb(241, 241, 241)" align="left" valign="inherit">

    							<p style="font-size: 16px; margin-bottom: 15px;"><span style="font-size: 12pt; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">Estamos entrando em contato para informar que a mensalidade referente ao seu plano da Adsgator, com <strong style="font-weight: 700; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">vencimento em 00/00/2026</strong>, continua em aberto ap&oacute;s v&aacute;rios avisos de cobran&ccedil;a enviados automaticamente pelo sistema e tamb&eacute;m pelo WhatsApp.</span></p>

    							<p style="color: rgb(51, 51, 51); font-family: Arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: -webkit-left; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; font-size: 16px; margin-bottom: 15px; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><span style="font-size: 12pt; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">Como o pagamento n&atilde;o foi identificado at&eacute; o momento, o seu plano foi cancelado, conforme previsto em nossos <a href="https://adsgator.com.br/termos-de-servico/" target="_blank" rel="noopener noreferrer" title="https://adsgator.com.br/termos-de-servico/" style="font-size: 12pt;">Termos de Servi&ccedil;o</a>.</span></p>
    							<div style="max-width: 100%; color: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 14.5px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: -webkit-left; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><span style="font-size: 12pt;"><br style="user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"></span></div>
    							<div data-block-id="block-3ae89fb9-d627-45d1-bd6b-30e6e8a32ee8" style="max-width: 100%; color: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 14.5px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: -webkit-left; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><span style="font-size: 12pt; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><strong style="font-weight: 700; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">Informa&ccedil;&atilde;o importante:</strong></span><span style="font-size: 12pt;"><br style="user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><br style="user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"></span></div>

    							<ul style="color: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 14.5px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: -webkit-left; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; user-select: inherit; scrollbar-color: auto; margin-bottom: 10.5px; margin-top: 0px; box-sizing: border-box; list-style-position: outside;">
    								<li style="font-size: 12pt; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">O e-mail profissional (caso utilize) permanecer&aacute; ativo at&eacute; <strong style="font-weight: 700; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">00</strong><strong style="font-weight: 700; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">/00/2026</strong>. Esse prazo serve para que voc&ecirc; possa migrar as mensagens ou configurar um novo servi&ccedil;o.</li>
    							</ul>
    							<div data-block-id="block-ed6fc98e-516d-4f31-9c32-784d9e69fe4c" style="max-width: 100%; color: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 14.5px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: -webkit-left; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><span style="font-size: 12pt; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">Ap&oacute;s a data <strong style="font-weight: 700; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">00</strong><strong style="font-weight: 700; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">/00/2026</strong>, tanto o site quanto o e-mail ser&atilde;o desativados da nossa hospedagem, n&atilde;o sendo mais poss&iacute;vel recuperar dados que n&atilde;o forem migrados.</span></div>
    							<div style="max-width: 100%; color: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 14.5px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: -webkit-left; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><span style="font-size: 12pt;"><br style="user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"></span><span style="font-size: 12pt; font-family: sans-serif, arial;"><br style="user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"></span></div>
    							<div data-block-id="block-e1d4b539-2be8-4581-8cce-5026988e6f67" style="max-width: 100%; color: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 14.5px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: -webkit-left; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><span style="font-size: 12pt; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><strong style="font-weight: 700; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">Para evitar o cancelamento:</strong> Basta realizar o pagamento que consta em atraso.</span></div>
    							<div data-block-id="block-e1d4b539-2be8-4581-8cce-5026988e6f67" style="max-width: 100%; color: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 14.5px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: -webkit-left; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><span style="font-size: 12pt; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">​</span><span style="font-size: 12pt;"><br style="user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"></span></div>
    							<div data-block-id="block-55dd782b-b014-4300-8aed-84c6f8e91e64" style="max-width: 100%; color: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 14.5px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: -webkit-left; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><span style="font-size: 12pt; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><span style="filter: grayscale(0.2) invert(0.88);"><span style="filter: grayscale(0.2) invert(0.88);">💳</span></span> <strong style="font-weight: 700; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">Link para regularizar:</strong> <span style="font-size: 12pt;" id="isPasted">[Link do Asaas aqui]</span></span></div>
    							<div data-block-id="block-55dd782b-b014-4300-8aed-84c6f8e91e64" style="max-width: 100%; color: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 14.5px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: -webkit-left; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><span style="font-size: 12pt; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">​</span><span style="font-size: 12pt;"><br style="user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"></span></div>
    							<div data-block-id="block-d82fc61c-93b7-46e0-968a-155deb7620dd" style="max-width: 100%; color: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 14.5px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: -webkit-left; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><span style="font-size: 12pt; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">Se voc&ecirc; j&aacute; realizou o pagamento, responda a este e-mail com o comprovante para que possamos normalizar a sua conta o quanto antes.</span></div>
    							<div data-block-id="block-d82fc61c-93b7-46e0-968a-155deb7620dd" style="max-width: 100%; color: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 14.5px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: -webkit-left; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><span style="font-size: 12pt; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">​</span>
    								<br>
    							</div>
    							<div data-block-id="block-9dcbdb84-2fec-4b5e-b7fd-f2e2199b16f9" style="max-width: 100%; color: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 14.5px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: -webkit-left; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;"><span style="font-size: 12pt; user-select: inherit; scrollbar-color: auto; box-sizing: border-box;">Qualquer d&uacute;vida, estamos &agrave; disposi&ccedil;&atilde;o.</span></div>
    						</td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #ffffff; padding: 20px; font-size: 12px; color: #888888;" bgcolor="rgb(255, 255, 255)" align="left" valign="inherit">

    							<p style="margin: 0;"><a href="https://adsgator.com.br/termos" style="color: #888888;">Termos de Servi&ccedil;o</a> | <a href="https://adsgator.com.br/privacidade" style="color: #888888;">Pol&iacute;tica de Privacidade</a> | <a href="https://adsgator.com.br/ajuda" style="color: #888888;">Central de Ajuda</a></p>

    							<p style="margin-top: 10px;">Este e-mail &eacute; somente para notifica&ccedil;&atilde;o. Para entrar em contato, envie um e-mail para <a href="mailto:contato@adsgator.com.br" style="color: #888888;">contato@adsgator.com.br</a>.</p>
    						</td>
    					</tr>
    				</tbody>
    			</table>
    		</td>
    	</tr>
    </tbody>

</table>

---

##Relatório GA4

<table width="100%" cellspacing="0" cellpadding="0" style="background-color: rgb(249, 249, 249); font-family: Arial, sans-serif; width: 100%;" bgcolor="rgb(249, 249, 249)">
	<tbody valign="middle">
		<tr valign="inherit">
			<td align="center" valign="inherit">

    			<table width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; width:100%; border-radius: 12px; overflow: hidden; box-shadow: rgba(0, 0, 0, 0.05) 0px 2px 8px; background-color: rgb(255, 255, 255); margin: 60px 0 60px 0;" bgcolor="rgb(255, 255, 255)">
    				<tbody valign="middle">
    					<tr valign="inherit">
    						<td style="padding: 0; background-color: #ffffff;" bgcolor="rgb(255, 255, 255)" align="center" valign="inherit"><img src="https://adsgator.com.br/wp-content/uploads/2025/11/banner-topo-email-comunicacao-v1.png" alt="Adsgator" width="600" height="130" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0px;" data-clarity-loaded="qvopa8"></td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #FFB100; padding: 30px 20px; color: #111111;" bgcolor="rgb(255, 177, 0)" align="left" valign="inherit">

    							<h1 style="margin: 0; font-size: 22px;"><span style="color: rgb(35, 31, 32);">✅ <strong data-start="97" data-end="132" id="isPasted">Relat&oacute;rio de Desempenho do Site</strong><br data-start="132" data-end="135">Google Analytics &ndash; /2026</span></h1>
    						</td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #F1F1F1; padding: 0 20px 30px 20px; color: #333333;" bgcolor="rgb(241, 241, 241)" align="left" valign="inherit">
    							<div style="user-select: inherit; scrollbar-color: var(--scrollbar-active-color) #0000; box-sizing: border-box;">
    								<br>
    							</div>

    							<p style="font-size: 16px; margin-bottom: 15px;"><span style="font-size: 12pt;">Em anexo, segue o <strong>relat&oacute;rio de desempenho do site</strong>, contendo as principais m&eacute;tricas de acessos, origens de tr&aacute;fego e comportamento dos visitantes, para que voc&ecirc; possa acompanhar a evolu&ccedil;&atilde;o da sua presen&ccedil;a digital.</span></p>

    							<p data-start="377" data-end="486"><span style="font-size: 12pt;">📌 Ao final do relat&oacute;rio, na <strong data-start="403" data-end="415">p&aacute;gina 6</strong>, voc&ecirc; encontra a an&aacute;lise do desempenho do site ao longo do &uacute;ltimo m&ecirc;s.</span></p>

    							<p data-start="488" data-end="552"><span style="font-size: 12pt;">Caso tenha qualquer d&uacute;vida, estamos &agrave; disposi&ccedil;&atilde;o para ajudar. 😊</span></p>
    						</td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #ffffff; padding: 20px; font-size: 12px; color: #888888;" bgcolor="rgb(255, 255, 255)" align="left" valign="inherit">

    							<p style="margin: 0;"><a href="https://adsgator.com.br/termos" style="color: #888888;">Termos de Servi&ccedil;o</a> | <a href="https://adsgator.com.br/privacidade" style="color: #888888;">Pol&iacute;tica de Privacidade</a> | <a href="https://adsgator.com.br/ajuda" style="color: #888888;">Central de Ajuda</a></p>

    							<p style="margin-top: 10px;">Este e-mail &eacute; somente para notifica&ccedil;&atilde;o. Para entrar em contato, envie um e-mail para <a href="mailto:contato@adsgator.com.br" style="color: #888888;">contato@adsgator.com.br</a>.</p>
    						</td>
    					</tr>
    				</tbody>
    			</table>
    		</td>
    	</tr>
    </tbody>

</table>

---

##Relatório GADS

<table width="100%" cellspacing="0" cellpadding="0" style="background-color: rgb(249, 249, 249); font-family: Arial, sans-serif; width: 100%;" bgcolor="rgb(249, 249, 249)">
	<tbody valign="middle">
		<tr valign="inherit">
			<td align="center" valign="inherit">

    			<table width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; width:100%; border-radius: 12px; overflow: hidden; box-shadow: rgba(0, 0, 0, 0.05) 0px 2px 8px; background-color: rgb(255, 255, 255); margin: 60px 0 60px 0;" bgcolor="rgb(255, 255, 255)">
    				<tbody valign="middle">
    					<tr valign="inherit">
    						<td style="padding: 0; background-color: #ffffff;" bgcolor="rgb(255, 255, 255)" align="center" valign="inherit"><img src="https://adsgator.com.br/wp-content/uploads/2025/11/banner-topo-email-comunicacao-v1.png" alt="Adsgator" width="600" height="130" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0px;" data-clarity-loaded="qvopa8"></td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #FFB100; padding: 30px 20px; color: #111111;" bgcolor="rgb(255, 177, 0)" align="left" valign="inherit">

    							<h1 style="margin: 0; font-size: 22px;"><span style="color: rgb(35, 31, 32);">✅ <strong data-start="106" data-end="133" id="isPasted">Relat&oacute;rio de Desempenho</strong><br data-start="133" data-end="136">Google Ads &ndash; /2026</span></h1>
    						</td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #F1F1F1; padding: 0 20px 30px 20px; color: #333333;" bgcolor="rgb(241, 241, 241)" align="left" valign="inherit">
    							<div style="user-select: inherit; scrollbar-color: var(--scrollbar-active-color) #0000; box-sizing: border-box;">
    								<br>
    							</div>

    							<p style="font-size: 16px; margin-bottom: 15px;"><span style="font-size: 12pt;">Em anexo, segue o <strong>relat&oacute;rio de Google Ads</strong> com os principais resultados da campanha, como impress&otilde;es, cliques, convers&otilde;es e custo por resultado, apresentando o desempenho dos an&uacute;ncios no per&iacute;odo.</span></p>

    							<p data-start="354" data-end="469"><span style="font-size: 12pt;">📌 Ao final do relat&oacute;rio, na <strong data-start="380" data-end="392">p&aacute;gina 8</strong>, voc&ecirc; encontra a an&aacute;lise do desempenho das campanhas ao longo do &uacute;ltimo m&ecirc;s.</span></p>

    							<p data-start="471" data-end="535"><span style="font-size: 12pt;">Caso tenha qualquer d&uacute;vida, estamos &agrave; disposi&ccedil;&atilde;o para ajudar. 😊</span></p>
    						</td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #ffffff; padding: 20px; font-size: 12px; color: #888888;" bgcolor="rgb(255, 255, 255)" align="left" valign="inherit">

    							<p style="margin: 0;"><a href="https://adsgator.com.br/termos" style="color: #888888;">Termos de Servi&ccedil;o</a> | <a href="https://adsgator.com.br/privacidade" style="color: #888888;">Pol&iacute;tica de Privacidade</a> | <a href="https://adsgator.com.br/ajuda" style="color: #888888;">Central de Ajuda</a></p>

    							<p style="margin-top: 10px;">Este e-mail &eacute; somente para notifica&ccedil;&atilde;o. Para entrar em contato, envie um e-mail para <a href="mailto:contato@adsgator.com.br" style="color: #888888;">contato@adsgator.com.br</a>.</p>
    						</td>
    					</tr>
    				</tbody>
    			</table>
    		</td>
    	</tr>
    </tbody>

</table>

---

##Saldo Google Ads Acabou

<table width="100%" cellspacing="0" cellpadding="0" style="background-color: rgb(249, 249, 249); font-family: Arial, sans-serif; width: 100%;" bgcolor="rgb(249, 249, 249)">
	<tbody valign="middle">
		<tr valign="inherit">
			<td align="center" valign="inherit">

    			<table width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; width:100%; border-radius: 12px; overflow: hidden; box-shadow: rgba(0, 0, 0, 0.05) 0px 2px 8px; background-color: rgb(255, 255, 255); margin: 60px 0 60px 0;" bgcolor="rgb(255, 255, 255)">
    				<tbody valign="middle">
    					<tr valign="inherit">
    						<td style="padding: 0; background-color: #ffffff;" bgcolor="rgb(255, 255, 255)" align="center" valign="inherit"><img src="https://adsgator.com.br/wp-content/uploads/2025/11/banner-topo-email-comunicacao-v1.png" alt="Adsgator" width="600" height="130" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0px;"></td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #FFB100; padding: 30px 20px; color: #111111;" bgcolor="rgb(255, 177, 0)" align="left" valign="inherit">

    							<h1 style="margin: 0; font-size: 22px;">⚠️ <span style="color: rgb(35, 31, 32);">Seu saldo do Google Ads acabou!</span></h1>
    						</td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #F1F1F1; padding: 0 20px 30px 20px; color: #333333;" bgcolor="rgb(241, 241, 241)" align="left" valign="inherit">
    							<div style="user-select: inherit; scrollbar-color: var(--scrollbar-active-color) #0000; box-sizing: border-box;">
    								<br>
    							</div>

    							<p style="font-size: 16px; margin-bottom: 15px;">Ol&aacute;! Detectamos que o saldo da sua conta do Google Ads acabou. Quando o saldo chega a zero, o Google pausa automaticamente a exibi&ccedil;&atilde;o dos seus an&uacute;ncios.</p>

    							<p style="font-size: 16px; margin-bottom: 20px;">Veja abaixo o saldo atual e o bot&atilde;o para recarregar:</p>

    							<table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgb(255, 255, 255); border-radius: 10px; width: 100%;" bgcolor="rgb(255, 255, 255)">
    								<tbody valign="middle">
    									<tr valign="inherit">
    										<td style="padding: 30px 25px; text-align: left;" align="left" valign="inherit">

    											<p style="margin: 0 0 5px 0; font-size: 14px; color: #333;"><strong>Fundos dispon&iacute;veis</strong></p>

    											<p style="margin: 0 0 15px 0; font-size: 28px; font-weight: bold; color: #007C00;">R$ 00</p>

    											<p style="margin: 0 0 20px 0; font-size: 14px; color: #a80000;"><strong>Os fundos acabaram</strong></p><a href="https://ads.google.com/aw/billing/summary" target="_blank" style="display: inline-block; background-color: #d90000; color: #ffffff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-size: 14px;">&nbsp;Adicionar fundos&nbsp;</a></td>
    									</tr>
    								</tbody>
    							</table>

    							<p style="font-size: 16px; margin-top: 25px;">📘 <strong>Veja o passo a passo para adicionar saldo:</strong>
    								<br><a href="https://ajuda.adsgator.com.br/ajuda/como-adicionar-saldo-no-google-ads/" target="_blank" style="color: #2969b0;">&nbsp;https://ajuda.adsgator.com.br/ajuda/como-adicionar-saldo-no-google-ads/&nbsp;</a></p>

    							<p style="font-size: 16px;">Caso tenha d&uacute;vidas, estamos a disposi&ccedil;&atilde;o para ajudar! 😊</p>
    						</td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #ffffff; padding: 20px; font-size: 12px; color: #888888;" bgcolor="rgb(255, 255, 255)" align="left" valign="inherit">

    							<p style="margin: 0;"><a href="https://adsgator.com.br/termos" style="color: #888888;">Termos de Servi&ccedil;o</a> | <a href="https://adsgator.com.br/privacidade" style="color: #888888;">Pol&iacute;tica de Privacidade</a> | <a href="https://adsgator.com.br/ajuda" style="color: #888888;">Central de Ajuda</a></p>

    							<p style="margin-top: 10px;">Este e-mail &eacute; enviado automaticamente. Para entrar em contato, envie um e-mail para <a href="mailto:contato@adsgator.com.br" style="color: #888888;">contato@adsgator.com.br</a>.</p>
    						</td>
    					</tr>
    				</tbody>
    			</table>
    		</td>
    	</tr>
    </tbody>

</table>

---

##Modelo de e-mail

<table width="100%" cellspacing="0" cellpadding="0" style="background-color: rgb(249, 249, 249); font-family: Arial, sans-serif; width: 100%;" bgcolor="rgb(249, 249, 249)">
	<tbody valign="middle">
		<tr valign="inherit">
			<td align="center" valign="inherit">

    			<table width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; width:100%; border-radius: 12px; overflow: hidden; box-shadow: rgba(0, 0, 0, 0.05) 0px 2px 8px; background-color: rgb(255, 255, 255); margin: 60px 0 60px 0;" bgcolor="rgb(255, 255, 255)">
    				<tbody valign="middle">
    					<tr valign="inherit">
    						<td style="padding: 0; background-color: #ffffff;" bgcolor="rgb(255, 255, 255)" align="center" valign="inherit"><img src="https://adsgator.com.br/wp-content/uploads/2025/11/banner-topo-email-comunicacao-v1.png" alt="Adsgator" width="600" height="130" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0px;" data-clarity-loaded="qvopa8"></td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #FFB100; padding: 30px 20px; color: #111111;" bgcolor="rgb(255, 177, 0)" align="left" valign="inherit">

    							<h1 style="margin: 0; font-size: 22px;"><span style="color: rgb(35, 31, 32);">[texto]</span></h1>
    						</td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #F1F1F1; padding: 0 20px 30px 20px; color: #333333;" bgcolor="rgb(241, 241, 241)" align="left" valign="inherit">

    							<p style="font-size: 16px; margin-bottom: 15px;">[texto]</p>
    						</td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #ffffff; padding: 20px; font-size: 12px; color: #888888;" bgcolor="rgb(255, 255, 255)" align="left" valign="inherit">

    							<p style="margin: 0;"><a href="https://adsgator.com.br/termos" style="color: #888888;">Termos de Servi&ccedil;o</a> | <a href="https://adsgator.com.br/privacidade" style="color: #888888;">Pol&iacute;tica de Privacidade</a> | <a href="https://adsgator.com.br/ajuda" style="color: #888888;">Central de Ajuda</a></p>

    							<p style="margin-top: 10px;">Este e-mail &eacute; somente para notifica&ccedil;&atilde;o. Para entrar em contato, envie um e-mail para <a href="mailto:contato@adsgator.com.br" style="color: #888888;">contato@adsgator.com.br</a>.</p>
    						</td>
    					</tr>
    				</tbody>
    			</table>
    		</td>
    	</tr>
    </tbody>

</table>

---

##Saldo Google Ads

<table width="100%" cellspacing="0" cellpadding="0" style="background-color: rgb(249, 249, 249); font-family: Arial, sans-serif; width: 100%;" bgcolor="rgb(249, 249, 249)">
	<tbody valign="middle">
		<tr valign="inherit">
			<td align="center" valign="inherit">

    			<table width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; width:100%; border-radius: 12px; overflow: hidden; box-shadow: rgba(0, 0, 0, 0.05) 0px 2px 8px; background-color: rgb(255, 255, 255); margin: 60px 0 60px 0;" bgcolor="rgb(255, 255, 255)">
    				<tbody valign="middle">
    					<tr valign="inherit">
    						<td style="padding: 0; background-color: #ffffff;" bgcolor="rgb(255, 255, 255)" align="center" valign="inherit"><img src="https://adsgator.com.br/wp-content/uploads/2025/11/banner-topo-email-comunicacao-v1.png" alt="Adsgator" width="600" height="130" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0px;"></td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #FFB100; padding: 30px 20px; color: #111111;" bgcolor="rgb(255, 177, 0)" align="left" valign="inherit">

    							<h1 style="margin: 0; font-size: 22px;">⚠️ <span style="color: rgb(35, 31, 32);">Seu saldo do Google Ads est&aacute; acabando!</span></h1>
    						</td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #F1F1F1; padding: 0 20px 30px 20px; color: #333333;" bgcolor="rgb(241, 241, 241)" align="left" valign="inherit">
    							<div style="user-select: inherit; scrollbar-color: var(--scrollbar-active-color) #0000; box-sizing: border-box;">
    								<br>
    							</div>

    							<p style="font-size: 16px; margin-bottom: 15px;">Ol&aacute;! Detectamos que o saldo da sua conta do Google Ads est&aacute; baixo. Quando o saldo chega a zero, o Google pausa automaticamente a exibi&ccedil;&atilde;o dos seus an&uacute;ncios.</p>

    							<p style="font-size: 16px; margin-bottom: 15px;">Para evitar qualquer interrup&ccedil;&atilde;o, recomendamos adicionar cr&eacute;ditos o quanto antes. Assim, suas campanhas continuam rodando normalmente.</p>

    							<p style="font-size: 16px; margin-bottom: 20px;">Veja abaixo o saldo atual e o bot&atilde;o para recarregar:</p>

    							<table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgb(255, 255, 255); border-radius: 10px; width: 100%;" bgcolor="rgb(255, 255, 255)">
    								<tbody valign="middle">
    									<tr valign="inherit">
    										<td style="padding: 30px 25px; text-align: left;" align="left" valign="inherit">

    											<p style="margin: 0 0 5px 0; font-size: 14px; color: #333;"><strong>Fundos dispon&iacute;veis</strong></p>

    											<p style="margin: 0 0 15px 0; font-size: 28px; font-weight: bold; color: #007C00;">R$ 00</p>

    											<p style="margin: 0 0 20px 0; font-size: 14px; color: #a80000;"><strong>Os fundos est&atilde;o acabando</strong></p><a href="https://ads.google.com/aw/billing/summary" target="_blank" style="display: inline-block; background-color: #d90000; color: #ffffff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-size: 14px;">&nbsp;Adicionar fundos&nbsp;</a></td>
    									</tr>
    								</tbody>
    							</table>

    							<p style="font-size: 16px; margin-top: 25px;">📘 <strong>Veja o passo a passo para adicionar saldo:</strong>
    								<br><a href="https://ajuda.adsgator.com.br/ajuda/como-adicionar-saldo-no-google-ads/" target="_blank" style="color: #2969b0;">&nbsp;https://ajuda.adsgator.com.br/ajuda/como-adicionar-saldo-no-google-ads/&nbsp;</a></p>

    							<p style="font-size: 16px;">Caso tenha d&uacute;vidas, <span style="color: rgb(51, 51, 51); font-family: Arial, sans-serif; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: -webkit-left; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(241, 241, 241); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; display: inline !important; float: none;" id="isPasted">estamos a disposi&ccedil;&atilde;o para ajudar!</span> 😊</p>
    						</td>
    					</tr>
    					<tr valign="inherit">
    						<td style="background-color: #ffffff; padding: 20px; font-size: 12px; color: #888888;" bgcolor="rgb(255, 255, 255)" align="left" valign="inherit">

    							<p style="margin: 0;"><a href="https://adsgator.com.br/termos" style="color: #888888;">Termos de Servi&ccedil;o</a> | <a href="https://adsgator.com.br/privacidade" style="color: #888888;">Pol&iacute;tica de Privacidade</a> | <a href="https://adsgator.com.br/ajuda" style="color: #888888;">Central de Ajuda</a></p>

    							<p style="margin-top: 10px;">Este e-mail &eacute; enviado automaticamente. Para entrar em contato, envie um e-mail para <a href="mailto:contato@adsgator.com.br" style="color: #888888;">contato@adsgator.com.br</a>.</p>
    						</td>
    					</tr>
    				</tbody>
    			</table>
    		</td>
    	</tr>
    </tbody>

</table>

---
