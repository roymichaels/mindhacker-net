import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { Wallet, TrendingUp, PiggyBank, CreditCard, Target, BarChart3 } from "lucide-react";
import { PillarHubLayout, PillarToolsGrid, PillarStatusCard, pillarColors } from "@/components/hub-shared";

const Finances = () => {
  const { language } = useTranslation();
  const navigate = useNavigate();
  const colors = pillarColors.finances;

  const tools = [
    { id: 'income', icon: TrendingUp, title: language === 'he' ? 'הכנסות' : 'Income', description: language === 'he' ? 'מעקב אחרי הכנסות' : 'Track your income' },
    { id: 'expenses', icon: CreditCard, title: language === 'he' ? 'הוצאות' : 'Expenses', description: language === 'he' ? 'ניהול הוצאות' : 'Manage expenses' },
    { id: 'savings', icon: PiggyBank, title: language === 'he' ? 'חסכון' : 'Savings', description: language === 'he' ? 'יעדי חיסכון' : 'Savings goals' },
    { id: 'investments', icon: BarChart3, title: language === 'he' ? 'השקעות' : 'Investments', description: language === 'he' ? 'מעקב השקעות' : 'Track investments' },
    { id: 'goals', icon: Target, title: language === 'he' ? 'יעדים' : 'Goals', description: language === 'he' ? 'יעדים פיננסיים' : 'Financial goals' },
    { id: 'budget', icon: Wallet, title: language === 'he' ? 'תקציב' : 'Budget', description: language === 'he' ? 'תכנון תקציב' : 'Budget planning' },
  ].map(t => ({ ...t, onClick: () => navigate('/finances/journey') }));

  return (
    <PillarHubLayout
      colors={colors}
      icon={Wallet}
      title={{ he: 'מרכז הפיננסים', en: 'Finances Hub' }}
      description={{ he: 'שלוט בכסף שלך ובנה עתיד פיננסי', en: 'Control your money and build financial future' }}
      journeyPath="/finances/journey"
      seoPath="/finances"
    >
      <PillarToolsGrid tools={tools} colors={colors} sectionTitle={language === 'he' ? 'כלים פיננסיים' : 'Finance Tools'} />
      <PillarStatusCard
        colors={colors}
        icon={Wallet}
        title={language === 'he' ? 'מדד הבריאות הפיננסית' : 'Financial Health Index'}
        description={language === 'he' ? 'השלם את המסע כדי לקבל את המדד שלך' : 'Complete the journey to get your index'}
        journeyPath="/finances/journey"
        buttonLabel={language === 'he' ? 'התחל את המסע' : 'Start the Journey'}
      />
    </PillarHubLayout>
  );
};

export default Finances;
