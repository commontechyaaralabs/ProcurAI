'use client';

import { CheckCircle2, Clock, Circle, AlertCircle, XCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { useState } from 'react';

interface WorkflowStage {
  id: string;
  name: string;
  status: 'completed' | 'in-progress' | 'pending' | 'rejected';
  timestamp?: string;
  approver?: string;
  remarks?: string;
}

interface ApprovalWorkflowMapProps {
  indentId: string;
  stages: WorkflowStage[];
  onStageClick?: (stageId: string) => void;
}

export function ApprovalWorkflowMap({ indentId, stages, onStageClick }: ApprovalWorkflowMapProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const getStageIcon = (status: WorkflowStage['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-[#E00420]" />;
      default:
        return <Circle className="w-5 h-5 text-[#9DA5A8]" />;
    }
  };

  const getStageColor = (status: WorkflowStage['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'in-progress':
        return 'border-yellow-500 bg-yellow-50';
      case 'rejected':
        return 'border-[#E00420] bg-[#E00420]/10';
      default:
        return 'border-[#DFE2E4] bg-white';
    }
  };

  const handleStageClick = (stage: WorkflowStage) => {
    setSelectedStage(selectedStage === stage.id ? null : stage.id);
    onStageClick?.(stage.id);
  };

  return (
    <div className="bg-white border border-[#DFE2E4] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#31343A]">Approval Workflow Timeline</h3>
        <span className="text-xs text-[#9DA5A8]">Indent: {indentId}</span>
      </div>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#DFE2E4]">
          {stages.map((stage, idx) => {
            if (idx === stages.length - 1) return null;
            const nextStage = stages[idx + 1];
            const isCompleted = stage.status === 'completed' && nextStage.status !== 'pending';
            return (
              <div
                key={`line-${idx}`}
                className={`absolute left-0 top-8 w-0.5 h-8 ${
                  isCompleted ? 'bg-green-500' : 'bg-[#DFE2E4]'
                }`}
                style={{ top: `${idx * 80}px` }}
              />
            );
          })}
        </div>

        {/* Stages */}
        <div className="space-y-4">
          {stages.map((stage, idx) => (
            <div
              key={stage.id}
              className={`relative pl-14 border-l-4 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${getStageColor(stage.status)}`}
              onClick={() => handleStageClick(stage)}
            >
              <div className="absolute -left-7 top-4">
                {getStageIcon(stage.status)}
              </div>
              
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-[#31343A]">{stage.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      stage.status === 'completed' ? 'bg-green-100 text-green-700' :
                      stage.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                      stage.status === 'rejected' ? 'bg-[#E00420]/10 text-[#E00420]' :
                      'bg-[#DFE2E4] text-[#9DA5A8]'
                    }`}>
                      {stage.status.replace('-', ' ')}
                    </span>
                  </div>
                  
                  {stage.timestamp && (
                    <p className="text-xs text-[#9DA5A8] mb-1">
                      {formatDateTime(stage.timestamp)}
                    </p>
                  )}
                  
                  {stage.approver && (
                    <p className="text-xs text-[#31343A] mb-1">
                      Approver: <span className="font-medium">{stage.approver}</span>
                    </p>
                  )}
                  
                  {selectedStage === stage.id && stage.remarks && (
                    <div className="mt-2 p-2 bg-white border border-[#DFE2E4] rounded text-xs text-[#31343A]">
                      <strong>Remarks:</strong> {stage.remarks}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {stages.every(s => s.status === 'completed') && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">Workflow completed successfully</span>
          </div>
        </div>
      )}
    </div>
  );
}

