from fpdf import FPDF

pdf = FPDF()
pdf.add_page()
pdf.set_font('Arial', size=12)

with open('learn_share_documentation.txt', 'r', encoding='utf-8') as f:
    for line in f:
        # Replace problematic characters with ASCII equivalents
        line = line.replace('–', '-').replace('—', '-').replace('"', '"').replace('"', '"').replace(''', "'").replace(''', "'").replace(''', "'").replace(''', "'").replace('…', '...').replace('•', '-')
        # Encode to latin-1, ignore errors
        try:
            line = line.encode('latin-1', 'ignore').decode('latin-1')
        except:
            line = line.encode('ascii', 'ignore').decode('ascii')
        pdf.cell(200, 10, txt=line.strip(), ln=True)

pdf.output('learn_share_documentation.pdf')