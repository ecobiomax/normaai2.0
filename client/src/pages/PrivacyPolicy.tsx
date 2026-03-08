import { Link } from "wouter";
import SEOHead, { webPageSchema, breadcrumbSchema } from "@/components/SEOHead";
import { Home, ChevronRight } from "lucide-react";

export default function PrivacyPolicy() {
  const schema = {
    "@graph": [
      webPageSchema(
        "Política de Privacidade — VibeDia",
        "Política de privacidade do VibeDia. Saiba como coletamos, usamos e protegemos seus dados pessoais.",
        "/politica-de-privacidade"
      ),
      breadcrumbSchema([
        { name: "Início", url: "/" },
        { name: "Política de Privacidade", url: "/politica-de-privacidade" },
      ]),
    ],
  };

  const lastUpdate = "08 de março de 2026";

  return (
    <>
      <SEOHead
        title="Política de Privacidade — VibeDia"
        description="Política de privacidade do VibeDia. Saiba como coletamos, usamos e protegemos seus dados pessoais conforme a LGPD."
        canonical="/politica-de-privacidade"
        noIndex={false}
        schema={schema}
      />

      <main>
        {/* Header */}
        <section style={{
          background: "linear-gradient(135deg, #1A2744 0%, #243358 100%)",
          padding: "2.5rem 0 2rem",
        }}>
          <div className="container">
            <nav className="breadcrumb" style={{ marginBottom: "1rem" }}>
              <Link href="/" style={{ color: "#9AAAC0", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Home size={13} /> Início
              </Link>
              <ChevronRight size={13} style={{ color: "#4A5F8A" }} />
              <span style={{ color: "#C9A84C" }}>Política de Privacidade</span>
            </nav>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 700,
              color: "#F8F4ED",
              marginBottom: "0.5rem",
            }}>
              Política de Privacidade
            </h1>
            <p style={{ color: "#9AAAC0", fontSize: "0.9375rem" }}>
              Última atualização: {lastUpdate}
            </p>
          </div>
        </section>

        <div className="gold-divider-thick" />

        <div className="container" style={{ padding: "3rem 1rem" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div className="vibe-card" style={{ padding: "2rem" }}>

              <section style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.375rem", color: "#1A2744", marginBottom: "0.875rem" }}>
                  1. Introdução
                </h2>
                <p style={{ color: "#4A5F8A", lineHeight: 1.8 }}>
                  O <strong style={{ color: "#1A2744" }}>VibeDia</strong> ("nós", "nosso" ou "portal"), acessível em <a href="https://www.vibedia.com.br" style={{ color: "#A07830" }}>www.vibedia.com.br</a>, está comprometido em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você visita nosso portal, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
                </p>
              </section>

              <div className="gold-divider" style={{ marginBottom: "2rem" }} />

              <section style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.375rem", color: "#1A2744", marginBottom: "0.875rem" }}>
                  2. Informações que Coletamos
                </h2>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#1A2744", marginBottom: "0.5rem", fontFamily: "'Inter', sans-serif" }}>
                  2.1 Dados Coletados Automaticamente
                </h3>
                <p style={{ color: "#4A5F8A", lineHeight: 1.8, marginBottom: "1rem" }}>
                  Quando você visita o VibeDia, podemos coletar automaticamente as seguintes informações:
                </p>
                <ul style={{ color: "#4A5F8A", lineHeight: 1.8, paddingLeft: "1.5rem", marginBottom: "1rem" }}>
                  <li>Endereço IP (anonimizado)</li>
                  <li>Tipo e versão do navegador</li>
                  <li>Sistema operacional</li>
                  <li>Páginas visitadas e tempo de permanência</li>
                  <li>Fonte de referência (como chegou ao site)</li>
                  <li>Data e hora do acesso</li>
                </ul>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#1A2744", marginBottom: "0.5rem", fontFamily: "'Inter', sans-serif" }}>
                  2.2 Cookies e Tecnologias Similares
                </h3>
                <p style={{ color: "#4A5F8A", lineHeight: 1.8 }}>
                  Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o tráfego do site e personalizar conteúdo. Os cookies podem incluir cookies de sessão (temporários) e cookies persistentes. Você pode controlar o uso de cookies nas configurações do seu navegador.
                </p>
              </section>

              <div className="gold-divider" style={{ marginBottom: "2rem" }} />

              <section style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.375rem", color: "#1A2744", marginBottom: "0.875rem" }}>
                  3. Como Usamos suas Informações
                </h2>
                <p style={{ color: "#4A5F8A", lineHeight: 1.8, marginBottom: "1rem" }}>
                  Utilizamos as informações coletadas para:
                </p>
                <ul style={{ color: "#4A5F8A", lineHeight: 1.8, paddingLeft: "1.5rem" }}>
                  <li>Operar e manter o portal VibeDia</li>
                  <li>Melhorar a experiência do usuário</li>
                  <li>Analisar o uso do site para aprimorar o conteúdo</li>
                  <li>Exibir publicidade relevante (Google AdSense e parceiros afiliados)</li>
                  <li>Detectar e prevenir fraudes e abusos</li>
                  <li>Cumprir obrigações legais</li>
                </ul>
              </section>

              <div className="gold-divider" style={{ marginBottom: "2rem" }} />

              <section style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.375rem", color: "#1A2744", marginBottom: "0.875rem" }}>
                  4. Publicidade e Links de Afiliados
                </h2>
                <p style={{ color: "#4A5F8A", lineHeight: 1.8, marginBottom: "1rem" }}>
                  O VibeDia exibe anúncios de terceiros, incluindo o <strong style={{ color: "#1A2744" }}>Google AdSense</strong> e links de afiliados. Esses serviços podem usar cookies para exibir anúncios relevantes com base em suas visitas anteriores ao nosso site e a outros sites na internet.
                </p>
                <p style={{ color: "#4A5F8A", lineHeight: 1.8 }}>
                  Quando você clica em links de afiliados, um cookie pode ser armazenado em seu dispositivo para rastrear a referência. Isso nos permite receber uma comissão por compras realizadas através desses links, sem custo adicional para você.
                </p>
              </section>

              <div className="gold-divider" style={{ marginBottom: "2rem" }} />

              <section style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.375rem", color: "#1A2744", marginBottom: "0.875rem" }}>
                  5. Compartilhamento de Dados
                </h2>
                <p style={{ color: "#4A5F8A", lineHeight: 1.8, marginBottom: "1rem" }}>
                  Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto nas seguintes circunstâncias:
                </p>
                <ul style={{ color: "#4A5F8A", lineHeight: 1.8, paddingLeft: "1.5rem" }}>
                  <li><strong style={{ color: "#1A2744" }}>Prestadores de serviço:</strong> empresas que nos auxiliam na operação do site (hospedagem, análise de dados)</li>
                  <li><strong style={{ color: "#1A2744" }}>Parceiros de publicidade:</strong> Google AdSense e redes de afiliados</li>
                  <li><strong style={{ color: "#1A2744" }}>Exigência legal:</strong> quando necessário por lei ou ordem judicial</li>
                </ul>
              </section>

              <div className="gold-divider" style={{ marginBottom: "2rem" }} />

              <section style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.375rem", color: "#1A2744", marginBottom: "0.875rem" }}>
                  6. Seus Direitos (LGPD)
                </h2>
                <p style={{ color: "#4A5F8A", lineHeight: 1.8, marginBottom: "1rem" }}>
                  Conforme a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
                </p>
                <ul style={{ color: "#4A5F8A", lineHeight: 1.8, paddingLeft: "1.5rem" }}>
                  <li>Confirmação da existência de tratamento de dados</li>
                  <li>Acesso aos seus dados pessoais</li>
                  <li>Correção de dados incompletos, inexatos ou desatualizados</li>
                  <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
                  <li>Portabilidade dos dados</li>
                  <li>Eliminação dos dados tratados com seu consentimento</li>
                  <li>Revogação do consentimento</li>
                </ul>
              </section>

              <div className="gold-divider" style={{ marginBottom: "2rem" }} />

              <section style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.375rem", color: "#1A2744", marginBottom: "0.875rem" }}>
                  7. Segurança dos Dados
                </h2>
                <p style={{ color: "#4A5F8A", lineHeight: 1.8 }}>
                  Implementamos medidas técnicas e organizacionais adequadas para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum método de transmissão pela internet é 100% seguro, e não podemos garantir segurança absoluta.
                </p>
              </section>

              <div className="gold-divider" style={{ marginBottom: "2rem" }} />

              <section style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.375rem", color: "#1A2744", marginBottom: "0.875rem" }}>
                  8. Conteúdo Gerado por Inteligência Artificial
                </h2>
                <p style={{ color: "#4A5F8A", lineHeight: 1.8 }}>
                  Todo o conteúdo do VibeDia (mensagens, frases e horóscopos) é gerado automaticamente por modelos de inteligência artificial. Este conteúdo é fornecido apenas para fins de entretenimento e inspiração. Os horóscopos não devem ser interpretados como previsões precisas ou conselhos profissionais.
                </p>
              </section>

              <div className="gold-divider" style={{ marginBottom: "2rem" }} />

              <section style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.375rem", color: "#1A2744", marginBottom: "0.875rem" }}>
                  9. Alterações nesta Política
                </h2>
                <p style={{ color: "#4A5F8A", lineHeight: 1.8 }}>
                  Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre alterações significativas publicando a nova política nesta página com a data de atualização. Recomendamos que você revise esta política regularmente.
                </p>
              </section>

              <div className="gold-divider" style={{ marginBottom: "2rem" }} />

              <section>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.375rem", color: "#1A2744", marginBottom: "0.875rem" }}>
                  10. Contato
                </h2>
                <p style={{ color: "#4A5F8A", lineHeight: 1.8, marginBottom: "0.75rem" }}>
                  Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados, entre em contato conosco:
                </p>
                <div style={{
                  background: "#F5E6B8",
                  border: "1px solid rgba(201,168,76,0.3)",
                  borderRadius: "0.75rem",
                  padding: "1.25rem",
                }}>
                  <p style={{ color: "#1A2744", fontWeight: 600, marginBottom: "0.375rem" }}>VibeDia — Portal de Frases e Horóscopo</p>
                  <p style={{ color: "#4A5F8A" }}>
                    E-mail:{" "}
                    <a href="mailto:jrmemachado@gmail.com" style={{ color: "#A07830", fontWeight: 600, textDecoration: "none" }}>
                      jrmemachado@gmail.com
                    </a>
                  </p>
                  <p style={{ color: "#4A5F8A", marginTop: "0.25rem" }}>
                    Site:{" "}
                    <a href="https://www.vibedia.com.br" style={{ color: "#A07830", textDecoration: "none" }}>
                      www.vibedia.com.br
                    </a>
                  </p>
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>
    </>
  );
}
